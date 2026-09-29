export type Topic =
  | "politica"
  | "futebol"
  | "tecnologia"
  | "inteligencia-artificial"
  | "comida"
  | "relacionamento"
  | "trabalho"
  | "dinheiro"
  | "aleatorio";

export type Message = {
  id: string;
  role: "tio" | "user";
  text: string;
  createdAt: number;
};

export type ConversationStats = {
  messageCount: number;
  irritation: number;
  contradictions: number;
  topicChanges: number;
  sourceChallenges: number;
  topicsDiscussed: Topic[];
  currentTopic: Topic | null;
};

export type ChatState = {
  started: boolean;
  messages: Message[];
  stats: ConversationStats;
  achievements: string[];
  replySequence: number;
};

export type ChatAction =
  | { type: "start" }
  | { type: "send"; text: string }
  | { type: "reply" }
  | { type: "clear" };
