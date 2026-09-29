import {
  contradictionResponses,
  genericResponses,
  irritationPrefixes,
  provocationResponses,
  sourceResponses,
  topicChangeResponses,
  topicResponses,
} from "./responses";
import type { ChatState, Topic } from "./types";

export type ReplyResult = {
  text: string;
  stats: ChatState["stats"];
  achievements: string[];
  replySequence: number;
};

const normalize = (text: string) =>
  text
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const topicPatterns: Array<{ topic: Topic; patterns: RegExp }> = [
  {
    topic: "inteligencia-artificial",
    patterns: /\b(inteligencia artificial|ia|chatgpt|robo|robos|algoritmo|machine learning)\b/,
  },
  {
    topic: "politica",
    patterns: /\b(politica|politico|governo|presidente|eleicao|eleicoes|congresso|pt|partido|politicos)\b/,
  },
  {
    topic: "futebol",
    patterns: /\b(futebol|time|jogo|gol|gols|juiz|copa|flamengo|corinthians|palmeiras|vasco|sele[cç][aã]o)\b/,
  },
  {
    topic: "tecnologia",
    patterns: /\b(tecnologia|celular|telefone|internet|wifi|aplicativo|app|computador|rede social|instagram)\b/,
  },
  {
    topic: "comida",
    patterns: /\b(comida|comer|receita|almoco|jantar|cafe|churrasco|feijao|arroz|dieta|restaurante)\b/,
  },
  {
    topic: "relacionamento",
    patterns: /\b(namoro|namorada|namorado|casamento|relacionamento|amor|ex|paquera|terminar)\b/,
  },
  {
    topic: "trabalho",
    patterns: /\b(trabalho|chefe|emprego|colega|reuniao|escritorio|profissao|carreira)\b/,
  },
  {
    topic: "dinheiro",
    patterns: /\b(dinheiro|preco|caro|barato|salario|conta|investimento|economia|mercado|inflacao)\b/,
  },
];

const pick = (items: string[], sequence: number) =>
  items[sequence % items.length];

export function createReply(state: ChatState): ReplyResult {
  const lastUserMessage = [...state.messages].reverse().find((message) => message.role === "user");
  const text = lastUserMessage?.text ?? "";
  const normalized = normalize(text);
  const sourceChallenge = /\b(fonte|fontes|link|prova|comprova|referencia|referencias|de onde voce tirou|cad[eê] a fonte)\b/.test(normalized);
  const contradiction =
    /\b(contradicao|contradisse|contradiz|contradizer|contraditorio|agora voce disse|mas voce disse|voce acabou de dizer|nao foi isso que voce falou|se decide)\b/.test(
      normalized,
    );
  const provocation =
    /\b(burro|mentiroso|mentira|fake|inventa|ridiculo|nao sabe nada|voce e uma ia|voce e um robo)\b/.test(
      normalized,
    );
  const explicitSubjectChange =
    /\b(mudando de assunto|mudando o assunto|enfim|falando nisso|outra coisa|deixa pra la)\b/.test(
      normalized,
    );
  const mentionsPt = /\b(pt|partido dos trabalhadores)\b/.test(normalized);
  const detectedTopic = topicPatterns.find(({ patterns }) => patterns.test(normalized))?.topic;
  const changedTopic =
    Boolean(detectedTopic) &&
    Boolean(state.stats.currentTopic) &&
    detectedTopic !== state.stats.currentTopic;
  const diverted = sourceChallenge || contradiction || explicitSubjectChange || changedTopic;
  const topicChanges = state.stats.topicChanges + Number(diverted);
  const sourceChallenges = state.stats.sourceChallenges + (sourceChallenge ? 1 : 0);
  const contradictions = state.stats.contradictions + (contradiction ? 1 : 0);
  const irritation = Math.min(
    5,
    state.stats.irritation +
      Number(sourceChallenge || contradiction || provocation || explicitSubjectChange || changedTopic) +
      (state.stats.messageCount > 0 && state.stats.messageCount % 4 === 3 ? 1 : 0),
  );
  const topicsDiscussed = detectedTopic && !state.stats.topicsDiscussed.includes(detectedTopic)
    ? [...state.stats.topicsDiscussed, detectedTopic]
    : state.stats.topicsDiscussed;

  const nextStats: ChatState["stats"] = {
    ...state.stats,
    messageCount: state.stats.messageCount + 1,
    irritation,
    contradictions,
    topicChanges,
    sourceChallenges,
    topicsDiscussed,
    currentTopic: detectedTopic ?? state.stats.currentTopic,
  };

  const sequence = state.replySequence;
  const nextAchievements: string[] = [];
  const award = (id: string) => {
    if (!state.achievements.includes(id) && !nextAchievements.includes(id)) {
      nextAchievements.push(id);
    }
  };

  if (state.stats.messageCount === 0) award("first-debate");
  if (sourceChallenge) award("whatsapp-source");
  if (mentionsPt) award("pt-detour");
  if (contradiction) award("contradiction");
  if (diverted) award("subject-change");
  if (irritation >= 4) award("not-discussing");
  if (nextStats.messageCount >= 8) award("family-debate");
  if (irritation >= 5) award("too-far");

  let response: string;
  if (sourceChallenge) {
    response = pick(sourceResponses, sequence);
  } else if (contradiction) {
    response = pick(contradictionResponses, sequence);
  } else if (provocation) {
    response = pick(provocationResponses, sequence);
  } else if (explicitSubjectChange) {
    response = pick(topicChangeResponses, sequence);
  } else if (detectedTopic) {
    response = pick(topicResponses[detectedTopic], sequence);
  } else if (state.stats.currentTopic && /\b(e por que|e ai|e entao|como assim|continua|me explica)\b/.test(normalized)) {
    response = pick(topicResponses[state.stats.currentTopic], sequence + 1);
  } else {
    response = pick(genericResponses, sequence);
  }

  if (irritation > 0) {
    const prefix = irritationPrefixes[irritation];
    response = prefix + response[0].toLocaleLowerCase("pt-BR") + response.slice(1);
  }

  return {
    text: response,
    stats: nextStats,
    achievements: nextAchievements,
    replySequence: sequence + 1,
  };
}
