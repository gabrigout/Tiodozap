import type { ChatState } from "./types";

const STORAGE_KEY = "tiominion-chat-v1";

export const initialChatState: ChatState = {
  started: false,
  messages: [],
  stats: {
    messageCount: 0,
    irritation: 0,
    contradictions: 0,
    topicChanges: 0,
    sourceChallenges: 0,
    topicsDiscussed: [],
    currentTopic: null,
  },
  achievements: [],
  replySequence: 0,
  ended: false,
};

export function loadChatState(): ChatState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialChatState;

    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "messages" in parsed &&
      Array.isArray(parsed.messages) &&
      "stats" in parsed &&
      typeof parsed.stats === "object" &&
      parsed.stats !== null &&
      "achievements" in parsed &&
      Array.isArray(parsed.achievements) &&
      "started" in parsed &&
      typeof parsed.started === "boolean" &&
      "replySequence" in parsed &&
      typeof parsed.replySequence === "number"
    ) {
      return {
        ...parsed,
        ended: "ended" in parsed && typeof parsed.ended === "boolean" ? parsed.ended : false,
      } as ChatState;
    }
  } catch (error) {
    console.error("Não foi possível restaurar a conversa salva.", error);
  }

  return initialChatState;
}

export function saveChatState(state: ChatState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Não foi possível salvar a conversa neste navegador.", error);
  }
}

export function clearSavedChat() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Não foi possível limpar a conversa salva.", error);
  }
}
