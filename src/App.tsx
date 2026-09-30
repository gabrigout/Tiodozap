import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import AchievementToast from "./components/AchievementToast";
import Avatar from "./components/Avatar";
import ChatHeader from "./components/ChatHeader";
import Composer from "./components/Composer";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import { ChatAIError, chatAIProvider } from "./features/chat/aiProvider";
import { chatReducer } from "./features/chat/chatReducer";
import { getNextConversationStats } from "./features/chat/engine";
import { cacheReply, getCachedReply } from "./features/chat/replyCache";
import { getQuickReply } from "./features/chat/shortReplies";
import { pickConversationEnding } from "./features/chat/responses";
import { clearSavedChat, loadChatState, saveChatState } from "./features/chat/storage";

const quickPrompts = [
  { emoji: "🧾", label: "Me manda a fonte então" },
  { emoji: "🪞", label: "Você acabou de se contradizer" },
  { emoji: "⚽", label: "E o futebol, hein?" },
];

export default function App() {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadChatState);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const [toastKey, setToastKey] = useState(0);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const lastAchievementCount = useRef(state.achievements.length);
  const latestMessage = state.messages[state.messages.length - 1];
  const lastUserMessage = latestMessage?.role === "user" ? latestMessage : null;
  const isTyping = Boolean(lastUserMessage && !state.ended);

  useEffect(() => {
    saveChatState(state);
  }, [state]);

  useEffect(() => {
    if (!isTyping || !lastUserMessage) return;
    const controller = new AbortController();
    const quickReply = getQuickReply(lastUserMessage.text, state.replySequence);
    const cachedReply = quickReply ? null : getCachedReply(lastUserMessage.text);
    const shouldCallAI =
      !quickReply && !cachedReply && !state.apiPaused && chatAIProvider.isEnabled();
    const responseDelay = shouldCallAI ? 5000 + Math.floor(Math.random() * 5001) : 0;
    const timeout = window.setTimeout(async () => {
      if (quickReply) {
        dispatch({ type: "reply", text: quickReply });
        return;
      }
      if (cachedReply) {
        dispatch({ type: "reply", text: cachedReply.text, sources: cachedReply.sources });
        return;
      }
      if (!state.apiPaused && chatAIProvider.isEnabled()) {
        try {
          const reply = await chatAIProvider.generateReply(
            state.messages,
            getNextConversationStats(state),
            controller.signal,
          );
          if (!controller.signal.aborted && reply) {
            cacheReply(lastUserMessage.text, reply);
            dispatch({
              type: "reply",
              text: reply.text,
              sources: reply.sources,
            });
            return;
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          console.warn(
            "O TioMinion não conseguiu acessar a resposta da IA.",
            error instanceof ChatAIError ? error.kind : error,
          );
          if (error instanceof ChatAIError && error.kind === "quota") {
            dispatch({
              type: "reply",
              text: pickConversationEnding(),
              pauseApi: true,
            });
            return;
          }
          setApiNotice("A IA não respondeu desta vez. O tio vai improvisar; você pode continuar ou tentar de novo.");
          dispatch({ type: "reply", retryable: true });
          return;
        }
      }

      if (controller.signal.aborted) return;
      dispatch({ type: "reply" });
    }, responseDelay);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    isTyping,
    lastUserMessage?.id,
    state.apiPaused,
    state.messages,
    state.replySequence,
    state.stats,
  ]);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [state.messages.length, isTyping]);

  useEffect(() => {
    const newAchievements = state.achievements.slice(lastAchievementCount.current);
    lastAchievementCount.current = state.achievements.length;
    if (newAchievements.length) {
      setToastQueue((queue) => [...queue, ...newAchievements]);
    }
  }, [state.achievements]);

  useEffect(() => {
    if (activeToast || toastQueue.length === 0) return;
    setActiveToast(toastQueue[0]);
    setToastQueue((queue) => queue.slice(1));
  }, [activeToast, toastQueue]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    setToastKey((key) => key + 1);
  }, []);

  function sendMessage(text: string) {
    setApiNotice(null);
    dispatch({ type: "send", text });
  }

  function retryReply() {
    setApiNotice(null);
    dispatch({ type: "retry" });
  }

  function newConversation() {
    if (!window.confirm("Apagar esta conversa e começar outra?")) return;
    clearSavedChat();
    dispatch({ type: "clear" });
    setApiNotice(null);
    setToastQueue([]);
    setActiveToast(null);
    lastAchievementCount.current = 0;
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="page-layout">
        <aside className="intro-panel">
          <a className="brand" href="/" aria-label="TioMinion início">
            <span className="brand__mark">tm.</span>
            <span>tiominion</span>
          </a>
          <div className="intro-panel__copy">
            <span className="eyebrow"><span /> UM PERSONAGEM, MIL OPINIÕES</span>
            <h2>Conversa de família.<br /><em>Sem o grupo.</em></h2>
            <p>Conheça o tio que tem uma opinião sobre tudo — e uma fonte que nunca encontra quando pedem.</p>
            <div className="intro-note">
              <div className="intro-note__avatar"><Avatar size="large" /></div>
              <div>
                <strong>“Eu vi num vídeo.”</strong>
                <span>A frase que começa tudo.</span>
              </div>
            </div>
          </div>
          <div className="intro-panel__footer">
            <div className="privacy-note"><span>🔒</span><p>Conversa salva só neste navegador.<br />Sem cadastro, sem julgamento.</p></div>
            <span className="version-label">EDIÇÃO DE GRUPO · Nº 001</span>
          </div>
        </aside>

        <section className="chat-card" aria-label="Conversa com TioMinion">
          <ChatHeader started={state.started} onNewConversation={newConversation} />
          <div className="chat-context">
            <span className="chat-context__icon">✳</span>
            <span>{chatAIProvider.isEnabled() && !state.apiPaused ? "Conversa com IA · TioMinion é um personagem fictício de humor" : "Modo de conversa local · TioMinion é um personagem fictício de humor"}</span>
          </div>
          <div className="conversation" ref={scrollContainer} aria-live="polite">
            {!state.started ? (
              <div className="welcome-screen">
                <div className="welcome-screen__illustration">
                  <div className="welcome-screen__spark welcome-screen__spark--one">✳</div>
                  <div className="welcome-screen__spark welcome-screen__spark--two">✦</div>
                  <Avatar size="large" />
                  <span className="welcome-screen__bubble">bom dia ☀️</span>
                </div>
                <span className="welcome-screen__overline">O TIO JÁ ESTÁ ONLINE</span>
                <h3>Pronto pra uma<br />conversa <em>inesquecível?</em></h3>
                <p>Puxe qualquer assunto. Ele provavelmente vai discordar — com muita confiança e zero fontes verificáveis.</p>
                <button className="start-button" type="button" onClick={() => dispatch({ type: "start" })}>
                  Começar conversa <span>→</span>
                </button>
                <div className="quick-prompts" aria-label="Sugestões para começar">
                  <span className="quick-prompts__label">OU MANDA ESSA</span>
                  {quickPrompts.map((prompt) => (
                    <button key={prompt.label} type="button" onClick={() => sendMessage(prompt.label)}>
                      <span>{prompt.emoji}</span>{prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="message-list">
                <div className="day-divider"><span>HOJE, NO GRUPO</span></div>
                {state.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
                {isTyping && <TypingIndicator />}
                {(apiNotice || state.apiPaused) && (
                  <div className="conversation-ended conversation-ended--retry" role="status">
                    <span>{state.apiPaused
                      ? "A IA pausou por limite de uso; o tio segue no improviso até você começar uma nova conversa."
                      : apiNotice}</span>
                    {!state.apiPaused && (
                      <button type="button" onClick={retryReply}>Tentar IA de novo</button>
                    )}
                  </div>
                )}
                {state.ended && (
                  <div className="conversation-ended" role="status">
                    O TioMinion encerrou o expediente por aqui. Comece uma nova conversa se quiser chamar ele de volta.
                  </div>
                )}
                {!isTyping && state.messages.length > 1 && (
                  <div className="conversation-footnote">As mensagens ficam salvas neste navegador. O bom senso, nem sempre.</div>
                )}
              </div>
            )}
          </div>
          {state.started && !state.ended ? (
            <Composer disabled={isTyping} onSend={sendMessage} />
          ) : state.ended ? (
            <div className="composer composer--ended">
              <span>O tio foi resolver umas coisas. Debate encerrado por hoje.</span>
              <button type="button" onClick={newConversation}>Nova conversa</button>
            </div>
          ) : (
            <div className="composer composer--locked">
              <span>Comece a conversa pra mandar sua mensagem</span>
              <span className="composer--locked__icon">↗</span>
            </div>
          )}
        </section>
      </div>
      <footer className="page-footer">
        <span>FEITO PRA RIR, NÃO PRA CONVENCER</span>
        <span><i /> 100% ficção · 0% fonte confiável</span>
      </footer>
      <AchievementToast
        key={toastKey}
        achievementId={activeToast}
        onDismiss={dismissToast}
      />
    </main>
  );
}
