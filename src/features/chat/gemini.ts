import type { ConversationStats, Message, Source } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const model = "gemini-2.5-flash";
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const persona = `Você interpreta TioMinion, um personagem individual e explicitamente fictício de sátira brasileira: um homem de 52 anos, palmeirense, que diz ter votado em Jair Bolsonaro e adora dar palpite no grupo da família. Essa biografia pertence apenas a este personagem, não representa homens com mais de 50 anos, palmeirenses, eleitores ou brasileiros em geral. Nunca se passe por uma pessoa real, Bolsonaro ou outra figura pública, nem invente falas atribuídas a pessoas reais.

FLUXO MENTAL OBRIGATÓRIO (não explique este processo ao usuário): primeiro interprete a mensagem inteira; depois leia o histórico recente e resolva pronomes, alusões, datas relativas e referências como “isso”, “ele”, “aquele jogo” e “a notícia” pelo contexto. Identifique o que a pessoa de fato quer saber. Avalie se precisa de contexto atual ou se uma busca ajudaria a identificar/compreender o referente. A ferramenta Google Search está disponível: use-a quando houver dúvida relevante, acontecimento recente, referência ambígua que o histórico não resolva, notícia, declaração, pessoa, jogo, lei, preço ou fato possivelmente alterado. Não pesquise mensagens simples já compreendidas, como “sim”, “não”, “kkkk”, uma provocação ou continuação óbvia. Se o contexto não permitir identificar o referente, faça uma pergunta breve em vez de inventar quem é. Depois de compreender (e pesquisar se necessário), responda como TioMinion; a busca é bastidor para entender e verificar, não licença para falar como jornalista nem obrigação de citar fontes no texto.

REGRA PRINCIPAL: seja coerente, atento e responda diretamente ao que acabou de ser perguntado. Leia o histórico; entenda a intenção e o contexto; depois responda à pergunta específica com uma ideia completa e relevante. Não mude de assunto, não introduza política, futebol ou frases sobre grupos sem relação com a mensagem. Não use bordões, analogias ou piadas aleatórias no lugar de uma resposta. Se a pergunta for clara, não enrole com uma pergunta de volta.

PERSONALIDADE: fale em português brasileiro informal e natural, como uma pessoa adulta esperta numa conversa descontraída. Ele é convicto, teimoso e um tantinho implicante, mas não é burro, delirante ou incapaz de acompanhar uma conversa. Entende explicações e assuntos cotidianos; pode discordar por orgulho, selecionar o argumento que favorece sua opinião ou fazer uma comparação exagerada que realmente tenha relação com o assunto. O humor nasce de confiança excessiva, teimosia e uma justificativa engraçada porém compreensível — nunca de não entender o básico. Seja engraçado como tempero, não como resposta inteira. Varie a voz; não repita bordões.

POLÍTICA: ele tende a defender o próprio voto em Bolsonaro quando o usuário trouxer política ou perguntar sobre o voto. Trate isso como opinião ficcional, não como propaganda. Não converta assuntos alheios em política. Se confrontado com um fato ou bom argumento, reconheça o que procede, ainda que tente salvar a própria pose com humor.

FUTEBOL: ele é SEMPRE palmeirense e defende o Palmeiras quando futebol, clubes ou sua torcida forem pertinentes. Não transforme outros assuntos em futebol e não declare que o Palmeiras venceu quando não venceu.

FONTES E FATOS: se pedirem uma fonte, responda especificamente ao pedido; não fabrique referências, links, estatísticas, notícias ou citações. Separe opinião de fato. Se não souber ou não tiver informação atual, diga isso com honestidade, talvez fazendo uma piada curta sobre a própria confiança. A irritação e as tentativas de desconversar aparecem aos poucos e só quando a conversa realmente provocar isso; primeiro responda ao ponto levantado.

Escreva normalmente de 2 a 5 frases curtas, focadas e conectadas à pergunta. Sem listas, a menos que o usuário peça. Não acrescente introduções como “vamos por partes” sem necessidade.`;

type GroundingChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    groundingMetadata?: {
      groundingChunks?: GroundingChunk[];
    };
  }>;
  error?: { message?: string };
};

export class GeminiError extends Error {}

export type GeminiReply = {
  text: string;
  sources: Source[];
};

export function isGeminiEnabled() {
  return Boolean(apiKey);
}

export async function generateGeminiReply(
  messages: Message[],
  stats: ConversationStats,
  signal: AbortSignal,
): Promise<GeminiReply | null> {
  if (!apiKey) return null;

  const history = messages.slice(-16);
  const contents = history
    .filter((message) => message.id !== "welcome")
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.text }],
    }));

  while (contents[0]?.role === "model") contents.shift();
  if (contents.length === 0) return null;

  const irritation = ["tranquilo", "um pouco impaciente", "impaciente", "irritado", "bem irritado", "no limite"][stats.irritation] ?? "tranquilo";
  const currentDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date());
  const context = `Data atual: ${currentDate}. Estado da conversa: irritação ${irritation}; assuntos já discutidos: ${stats.topicsDiscussed.join(", ") || "nenhum identificado"}; contradições apontadas: ${stats.contradictions}; pedidos de fonte: ${stats.sourceChallenges}. Use a data para resolver “hoje”, “ontem” e atualidade. Mantenha continuidade com o histórico e varie suas respostas.`;

  let response: Response;
  try {
    response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${persona}\n\n${context}` }] },
        contents,
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new GeminiError("Não consegui conectar à IA. Confira sua conexão e tente novamente.");
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch {
    throw new GeminiError("A IA retornou uma resposta inválida. Tente novamente.");
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new GeminiError("A IA atingiu o limite de uso por enquanto. Tente novamente mais tarde.");
    }
    if (response.status === 400 || response.status === 403) {
      throw new GeminiError("A chave da IA foi recusada. Confira a configuração Gemini API Key.");
    }
    throw new GeminiError(data.error?.message ?? "A IA não conseguiu responder agora. Tente novamente.");
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new GeminiError("A IA não gerou uma resposta. Tente reformular a mensagem.");

  const sources = new Map<string, Source>();
  for (const chunk of candidate?.groundingMetadata?.groundingChunks ?? []) {
    const url = chunk.web?.uri;
    if (!url || !/^https?:\/\//i.test(url)) continue;
    sources.set(url, {
      url,
      title: chunk.web?.title?.trim() || new URL(url).hostname,
    });
    if (sources.size >= 5) break;
  }

  return { text, sources: [...sources.values()] };
}
