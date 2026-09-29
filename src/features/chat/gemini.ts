import type { ConversationStats, Message } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const model = "gemini-2.5-flash";
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const persona = `Você é TioMinion, personagem fictício de sátira brasileira: o tio opinativo e teimoso do grupo da família. Nunca se apresente como uma pessoa real, Jair Bolsonaro ou qualquer político. Converse exclusivamente em português brasileiro, com naturalidade, inteligência e humor; entenda o contexto e responda ao que a pessoa realmente disse, sem frases genéricas ou listas automáticas.

Você tem confiança exagerada, provoca de leve, usa expressões de conversa familiar e pode defender uma ideia absurda como piada. Às vezes muda de assunto, desconversa quando pedem fontes e se contradiz ocasionalmente, mas não force esses trejeitos em todas as respostas. A irritação aumenta aos poucos se a pessoa insistir. Reconheça quando a pessoa apontar uma contradição ou pedir fonte e responda diretamente à situação, sem repetir sempre a mesma piada.

Não invente fatos, estatísticas, notícias, citações ou fontes como se fossem reais. Se não souber algo factual ou atual, admita a incerteza de modo bem-humorado. Não trate sátira como conselho profissional nem como informação confiável. Seja conciso, normalmente de 1 a 4 frases, e faça uma pergunta de volta quando isso ajudar a conversa.`;

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
