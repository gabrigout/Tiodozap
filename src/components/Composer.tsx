import { useState, type FormEvent, type KeyboardEvent } from "react";

type ComposerProps = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export default function Composer({ disabled, onSend }: ComposerProps) {
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || disabled) return;
    onSend(message);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <label className="sr-only" htmlFor="message-input">Escreva sua mensagem para o TioMinion</label>
      <textarea
        id="message-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Manda a real pro tio..."
        rows={1}
        maxLength={1000}
        disabled={disabled}
      />
      <button
        className="send-button"
        type="submit"
        disabled={disabled || !draft.trim()}
        aria-label="Enviar mensagem"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 3-7.2 18-3.6-7.2L3 10.2 21 3Zm0 0-10.8 10.8" />
        </svg>
      </button>
      <div className="composer__hint"><span>Enter</span> para enviar <b>·</b> <span>Shift + Enter</span> para pular linha</div>
    </form>
  );
}
