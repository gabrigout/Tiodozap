import { createReply } from "./engine";
import { initialChatState } from "./storage";
import type { ChatAction, ChatState } from "./types";

const welcomeMessage = {
  id: "welcome",
  role: "tio" as const,
  text: "Aí, apareceu! Sou palmeirense, votei no Bolsonaro e tenho opinião formada — mas não me confunde com qualquer tio do grupo, viu? Cada um tem sua história. Manda o assunto: eu respondo sem precisar transformar tudo em política... quer dizer, vou tentar.",
  createdAt: Date.now(),
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "start":
      if (state.started || state.ended) return state;
      return { ...state, started: true, messages: [welcomeMessage] };
    case "send": {
      const text = action.text.trim();
      if (!text || state.ended) return state;
      const started = state.started;
      const userMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role: "user" as const,
        text,
        createdAt: Date.now(),
      };
      const messages = started ? [...state.messages, userMessage] : [welcomeMessage, userMessage];
      return { ...state, started: true, messages };
    }
    case "reply": {
      if (state.ended) return state;
      if (state.messages[state.messages.length - 1]?.role !== "user") return state;
      const reply = createReply(state);
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `${Date.now()}-tio`,
            role: "tio",
            text: action.text ?? reply.text,
            createdAt: Date.now(),
            sources: action.sources,
          },
        ],
        stats: reply.stats,
        achievements: [...state.achievements, ...reply.achievements],
        replySequence: reply.replySequence,
        apiPaused: state.apiPaused || action.pauseApi === true,
        apiRetrySnapshot: action.retryable
          ? {
              stats: state.stats,
              achievements: state.achievements,
              replySequence: state.replySequence,
            }
          : null,
      };
    }
    case "retry": {
      if (!state.apiRetrySnapshot || state.messages[state.messages.length - 1]?.role !== "tio") {
        return state;
      }
      return {
        ...state,
        messages: state.messages.slice(0, -1),
        stats: state.apiRetrySnapshot.stats,
        achievements: state.apiRetrySnapshot.achievements,
        replySequence: state.apiRetrySnapshot.replySequence,
        apiRetrySnapshot: null,
      };
    }
    case "end": {
      if (state.ended || state.messages[state.messages.length - 1]?.role !== "user") return state;
      const reply = createReply(state);
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `${Date.now()}-tio-fim`,
            role: "tio",
            text: action.text,
            createdAt: Date.now(),
          },
        ],
        stats: reply.stats,
        achievements: [...state.achievements, ...reply.achievements],
        replySequence: reply.replySequence,
        ended: true,
        endedReason: action.reason,
      };
    }
    case "clear":
      return { ...initialChatState };
  }
}
