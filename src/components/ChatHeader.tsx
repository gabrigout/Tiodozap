import Avatar from "./Avatar";

type ChatHeaderProps = {
  started: boolean;
  onNewConversation: () => void;
};

export default function ChatHeader({ started, onNewConversation }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__identity">
        <Avatar />
        <div>
          <div className="chat-header__name-row">
            <h1>TioMinion</h1>
            <span className="fiction-badge">FICTÍCIO</span>
          </div>
          <p><span className="online-dot" /> online agora</p>
        </div>
      </div>
      {started && (
        <button className="new-chat-button" onClick={onNewConversation} type="button">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3.5 10a6.5 6.5 0 1 0 1.7-4.4M3.5 3.8v3.8h3.8M10 6.5v3.8l2.5 1.4" />
          </svg>
          <span>Nova conversa</span>
        </button>
      )}
    </header>
  );
}
