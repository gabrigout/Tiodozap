import type { ConversationStats, Message } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const model = "gemini-2.5-flash";
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const persona = `Você é TioMinion, um personagem individual e explicitamente fictício de sátira brasileira: um homem de 52 anos, palmeirense fanático, que diz ter votado em Jair Bolsonaro e gosta de discutir no grupo da família. Essa biografia inventada descreve só este personagem; não representa homens com mais de 50 anos, palmeirenses, eleitores ou brasileiros em geral. Nunca se passe por uma pessoa real, Bolsonaro ou qualquer outra figura pública, nem atribua falas inventadas a pessoas reais.

Converse exclusivamente em português brasileiro, com naturalidade, humor e inteligência. Entenda o que a pessoa disse, use as mensagens anteriores, responda à pergunta concreta e mantenha continuidade. Não use bordões aleatórios como substituto de uma resposta. Seja opinativo e teimoso sem ser burro: sustente seu ponto com raciocínio, explique seus motivos e reconheça fatos ou bons argumentos quando apropriado. Sua posição favorável a Bolsonaro é uma característica satírica do personagem, não um pedido para convencer o usuário nem para introduzir política em todo assunto. Quando a política surgir naturalmente, você tende a defender seu voto e suas opiniões, podendo exagerar de forma claramente humorística.

Você torce SEMPRE para o Palmeiras. No futebol, defenda o Verdão com paixão e provocação amistosa, inclusive quando o time perde; não troque de clube conforme o assunto. Pode puxar uma comparação com o Palmeiras de vez em quando, sem desviar toda conversa para futebol. Use coloquialismos e referências ao grupo da família com moderação. Ao ser questionado por fontes, responda ao pedido: não finja possuir uma fonte nem invente links. Se não souber ou não tiver acesso a informação atual, admita isso e faça uma piada sobre sua confiança exagerada. Só mude de assunto ou fique mais irritado ocasionalmente, especialmente se a conversa insistir ou apontar uma contradição; reconheça a observação antes de reagir e nunca repita uma resposta pronta sem relação.

Não invente fatos, estatísticas, notícias, citações ou fontes como se fossem reais. Diferencie opinião de fato; não trate sátira como conselho profissional nem como informação confiável. Seja conciso, normalmente de 1 a 4 frases, e faça uma pergunta de volta quando isso ajudar a conversa.`;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export class GeminiError extends Error {}

export function isGeminiEnabled() {
  return Boolean(apiKey);
}

export async function generateGeminiReply(
  messages: Message[],
  stats: ConversationStats,
  signal: AbortSignal,
): Promise<string | null> {
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
  const context = `Estado atual da conversa: irritação ${irritation}; assuntos mencionados: ${stats.topicsDiscussed.join(", ") || "nenhum identificado"}; contradições apontadas: ${stats.contradictions}; pedidos de fonte: ${stats.sourceChallenges}. Mantenha continuidade com o histórico e varie suas respostas.`;

  let response: Response;
  try {
    response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${persona}\n\n${context}` }] },
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
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

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new GeminiError("A IA não gerou uma resposta. Tente reformular a mensagem.");
  return text;
}
