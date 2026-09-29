type AvatarProps = {
  size?: "small" | "large";
};

export default function Avatar({ size = "small" }: AvatarProps) {
  return (
    <div className={`avatar avatar--${size}`} aria-label="Avatar ilustrado do TioMinion">
      <svg viewBox="0 0 56 56" role="img" aria-hidden="true">
        <circle cx="28" cy="28" r="28" fill="#d6e6bd" />
        <path d="M12 51c1.8-10.5 8-15.5 16-15.5S42.2 40.5 44 51" fill="#29483a" />
        <path d="M18 33c0-11.3 4-19 10-19s10 7.7 10 19c0 6.1-4.6 10.5-10 10.5S18 39.1 18 33Z" fill="#efbd8b" />
        <path d="M17 25c0-11.7 5.4-18 13-18 5.6 0 9.4 4.1 9.4 8.2 4.1 2 5.7 6.4 4.4 10.8-2.8-2.8-5.2-4.5-8.2-5.1-5.3 2-11.1 2.1-18.6 1.1Z" fill="#5a4331" />
        <path d="M17 27h11v6H17c-1.8 0-3.1-1.3-3.1-3s1.3-3 3.1-3Zm12 0h11c1.8 0 3.1 1.3 3.1 3s-1.3 3-3.1 3H29Z" fill="#26352e" />
        <path d="M27.5 30h2" stroke="#d6e6bd" strokeWidth="2" />
        <path d="M23 37c2.7 2.2 7.3 2.2 10 0" fill="none" stroke="#875439" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <span className="avatar__status" />
    </div>
  );
}
