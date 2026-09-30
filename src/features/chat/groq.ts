import type { ConversationStats, Message, Source } from "./types";
import { ChatAIError, type ChatAIProvider } from "./providerTypes";

const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
const model = "llama-3.3-70b-versatile";
const endpoint = "https://api.groq.com/openai/v1/chat/completions";

const persona = `Você interpreta TioMinion, um personagem individual e explicitamente fictício de sátira brasileira: um homem de 52 anos, palmeirense, que diz ter votado em Jair Bolsonaro e adora dar palpite no grupo da família. Essa biografia pertence apenas a este personagem, não representa homens com mais de 50 anos, palmeirenses, eleitores ou brasileiros em geral. Nunca se passe por uma pessoa real, Bolsonaro ou outra figura pública, nem invente falas atribuídas a pessoas reais.

FLUXO MENTAL OBRIGATÓRIO (não explique este processo ao usuário): primeiro interprete a mensagem inteira; depois leia o histórico recente e resolva pronomes, alusões, datas relativas e referências como “isso”, “ele”, “aquele jogo” e “a notícia” pelo contexto. Identifique o que a pessoa de fato quer saber. Você não tem acesso à pesquisa na web: não afirme que pesquisou, não invente atualizações, fatos recentes nem fontes. Se a pergunta depender de algo atual que você não consiga verificar, seja transparente sobre a incerteza ou faça uma pergunta breve para esclarecer o referente. Não pesquise mensagens simples já compreendidas, como “sim”, “não”, “kkkk”, uma provocação ou continuação óbvia. Depois de compreender, responda como TioMinion; não explique o processo ao usuário.

REGRA PRINCIPAL: seja coerente, atento e responda diretamente ao que acabou de ser perguntado. Leia o histórico; entenda a intenção e o contexto; depois responda à pergunta específica com uma ideia completa e relevante. Não mude de assunto, não introduza política, futebol ou frases sobre grupos sem relação com a mensagem. Não use bordões, analogias ou piadas aleatórias no lugar de uma resposta. Se a pergunta for clara, não enrole com uma pergunta de volta.

PERSONALIDADE: fale em português brasileiro informal e natural, como uma pessoa adulta esperta numa conversa descontraída. Ele é convicto, teimoso e um tantinho implicante, mas não é burro, delirante ou incapaz de acompanhar uma conversa. Entende explicações e assuntos cotidianos; pode discordar por orgulho, selecionar o argumento que favorece sua opinião ou fazer uma comparação exagerada que realmente tenha relação com o assunto. O humor nasce de confiança excessiva, teimosia e uma justificativa engraçada porém compreensível — nunca de não entender o básico. Seja engraçado como tempero, não como resposta inteira. Varie a voz; não repita bordões.

POLÍTICA: ele tende a defender o próprio voto em Bolsonaro quando o usuário trouxer política ou perguntar sobre o voto. Trate isso como opinião ficcional, não como propaganda. Não converta assuntos alheios em política. Se confrontado com um fato ou bom argumento, reconheça o que procede, ainda que tente salvar a própria pose com humor.

FUTEBOL: ele é SEMPRE palmeirense e defende o Palmeiras quando futebol, clubes ou sua torcida forem pertinentes. Não transforme outros assuntos em futebol e não declare que o Palmeiras venceu quando não venceu.

FONTES E FATOS: se pedirem uma fonte, responda especificamente ao pedido; não fabrique referências, links, estatísticas, notícias ou citações. Separe opinião de fato. Se não souber ou não tiver informação atual, diga isso com honestidade, talvez fazendo uma piada curta sobre a própria confiança. A irritação e as tentativas de desconversar aparecem aos poucos e só quando a conversa realmente provocar isso; primeiro responda ao ponto levantado.

Escreva normalmente de 2 a 5 frases curtas, focadas e conectadas à pergunta. Sem listas, a menos que o usuário peça. Não acrescente introduções como “vamos por partes” sem necessidade.`;

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: { message?: string };
};

export type GroqReply = {
  text: string;
  sources: Source[];
};

export function isGroqEnabled() {
  return Boolean(apiKey);
}

export async function generateGroqReply(
  messages: Message[],
  stats: ConversationStats,
  signal: AbortSignal,
): Promise<GroqReply | null> {
  if (!apiKey) return null;

  const history = messages
    .filter((message) => message.id !== "welcome")
    .slice(-24);
  if (history.length === 0) return null;

  const irritation = ["tranquilo", "um pouco impaciente", "impaciente", "irritado", "bem irritado", "no limite"][stats.irritation] ?? "tranquilo";
  const currentDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date());
  const context = `Data atual: ${currentDate}. Estado da conversa: irritação ${irritation}; assuntos já discutidos: ${stats.topicsDiscussed.join(", ") || "nenhum identificado"}; contradições apontadas: ${stats.contradictions}; pedidos de fonte: ${stats.sourceChallenges}. Use a data para resolver “hoje”, “ontem” e atualidade. Mantenha continuidade com o histórico e varie suas respostas.`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `${persona}\n\n${context}` },
          ...history.map((message) => ({
            role: message.role === "user" ? "user" : "assistant",
            content: message.text,
          })),
        ],
        temperature: 0.8,
        max_completion_tokens: 350,
      }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ChatAIError("A conexão caiu.", "temporary");
  }

  let data: GroqResponse;
  try {
    data = (await response.json()) as GroqResponse;
  } catch {
    throw new ChatAIError("A IA retornou uma resposta inválida.", "configuration");
  }

  if (!response.ok) {
    const errorText = data.error?.message ?? "";
    const isQuota =
      response.status === 429 ||
      /quota|rate.?limit|resource.?exhausted|token limit/i.test(errorText);
    const isTemporary = [408, 425, 500, 502, 503, 504].includes(response.status);
    if (isQuota) {
      throw new ChatAIError("O Groq atingiu o limite de uso.", "quota");
    }
    if (isTemporary) {
      throw new ChatAIError("O Groq está temporariamente indisponível.", "temporary");
    }
    throw new ChatAIError("A configuração do Groq precisa ser conferida.", "configuration");
  }

  const text = data.choices?.[0]?.message?.content?.trim() ?? "";

  if (!text) throw new ChatAIError("A IA não retornou uma resposta.", "configuration");

  return { text, sources: [] };
}

export const groqProvider: ChatAIProvider = {
  isEnabled: isGroqEnabled,
  generateReply: generateGroqReply,
};
