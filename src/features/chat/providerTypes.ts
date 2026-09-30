import type { ConversationStats, Message, Source } from "./types";

export type ChatAIReply = {
  text: string;
  sources: Source[];
};

export type ChatAIFailureKind = "quota" | "temporary" | "configuration";

export class ChatAIError extends Error {
  constructor(
    message: string,
    readonly kind: ChatAIFailureKind,
  ) {
    super(message);
    this.name = "ChatAIError";
  }
}

export interface ChatAIProvider {
  isEnabled(): boolean;
  generateReply(
    messages: Message[],
    stats: ConversationStats,
    signal: AbortSignal,
  ): Promise<ChatAIReply | null>;
}
