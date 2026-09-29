import { useEffect } from "react";
import { getAchievement } from "../features/chat/achievements";

type AchievementToastProps = {
  achievementId: string | null;
  onDismiss: () => void;
};

export default function AchievementToast({ achievementId, onDismiss }: AchievementToastProps) {
  const achievement = achievementId ? getAchievement(achievementId) : undefined;

  useEffect(() => {
    if (!achievement) return;
    const timeout = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timeout);
  }, [achievement, onDismiss]);

  if (!achievement) return null;
  return (
    <div className="achievement-toast" role="status">
      <span className="achievement-toast__icon">{achievement.icon}</span>
      <div>
        <span className="achievement-toast__label">CONQUISTA DESBLOQUEADA</span>
        <strong>{achievement.title}</strong>
      </div>
      <button type="button" aria-label="Fechar aviso" onClick={onDismiss}>×</button>
    </div>
  );
}
