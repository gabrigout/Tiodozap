import Avatar from "./Avatar";

export default function TypingIndicator() {
  return (
    <div className="typing-row" role="status" aria-label="TioMinion está digitando">
      <Avatar />
      <div className="typing-bubble">
        <span>TioMinion está digitando</span>
        <i /><i /><i />
      </div>
    </div>
  );
}
