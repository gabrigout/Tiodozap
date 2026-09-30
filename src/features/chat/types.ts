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

export type ConversationEndReason = "api-limit" | "service-unavailable";

export type Message = {
  id: string;
  role: "tio" | "user";
  text: string;
  createdAt: number;
  sources?: Source[];
};

export type Source = {
  title: string;
  url: string;
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
  ended: boolean;
  endedReason: ConversationEndReason | null;
  apiPaused: boolean;
  apiRetrySnapshot: {
    stats: ConversationStats;
    achievements: string[];
    replySequence: number;
  } | null;
};

export type ChatAction =
  | { type: "start" }
  | { type: "send"; text: string }
  | { type: "reply"; text?: string; sources?: Source[]; pauseApi?: boolean; retryable?: boolean }
  | { type: "retry" }
  | { type: "end"; text: string; reason: ConversationEndReason }
  | { type: "clear" };
