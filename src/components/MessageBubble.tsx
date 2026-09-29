import type { Message } from "../features/chat/types";
import Avatar from "./Avatar";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={`message-row ${isUser ? "message-row--user" : ""}`}>
      {!isUser && <Avatar />}
      <article className={`message-bubble ${isUser ? "message-bubble--user" : ""}`}>
        {!isUser && <span className="message-bubble__name">TioMinion</span>}
        <p>{message.text}</p>
        {message.sources && message.sources.length > 0 && (
          <details className="message-sources">
            <summary>Contexto consultado · {message.sources.length} {message.sources.length === 1 ? "fonte" : "fontes"}</summary>
            <div className="message-sources__links">
              {message.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              ))}
            </div>
          </details>
        )}
        <time dateTime={new Date(message.createdAt).toISOString()}>{formatTime(message.createdAt)}</time>
      </article>
      {isUser && <div className="user-avatar" aria-hidden="true">Você</div>}
    </div>
  );
}
