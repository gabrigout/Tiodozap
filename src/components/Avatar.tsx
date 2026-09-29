type AvatarProps = {
  size?: "small" | "large";
};

export default function Avatar({ size = "small" }: AvatarProps) {
  return (
    <div className={`avatar avatar--${size}`}>
      <img src={`${import.meta.env.BASE_URL}tio-minion.jpg`} alt="TioMinion" />
      <span className="avatar__status" />
    </div>
  );
}
