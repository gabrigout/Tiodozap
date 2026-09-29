export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const achievements: Achievement[] = [
  {
    id: "first-debate",
    title: "Primeira discussão",
    description: "O grupo acaba de ser criado.",
    icon: "🥇",
  },
  {
    id: "whatsapp-source",
    title: "Fonte: WhatsApp",
    description: "Uma fonte muito confiável apareceu.",
    icon: "🧾",
  },
  {
    id: "pt-detour",
    title: "E o PT?",
    description: "A conversa encontrou seu desvio favorito.",
    icon: "🗣️",
  },
  {
    id: "contradiction",
    title: "Contradição detectada",
    description: "A lógica pediu um minuto.",
    icon: "🪞",
  },
  {
    id: "subject-change",
    title: "Mudou de assunto",
    description: "Uma saída estratégica perfeitamente calculada.",
    icon: "🏃",
  },
  {
    id: "not-discussing",
    title: "Não vou discutir",
    description: "Ele disse, no meio de uma discussão.",
    icon: "🙉",
  },
  {
    id: "family-debate",
    title: "Debate de família",
    description: "A conversa já virou tradição de domingo.",
    icon: "🍽️",
  },
  {
    id: "too-far",
    title: "Você foi longe demais",
    description: "O tio abriu o caps lock imaginário.",
    icon: "🌋",
  },
];

export const getAchievement = (id: string) =>
  achievements.find((achievement) => achievement.id === id);
