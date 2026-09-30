const quickReplies: Record<string, string[]> = {
  k: [
    "Riu, né? Eu sabia que esse argumento tinha potencial.",
    "Kkkkk pronto, pelo menos alguém nessa conversa reconhece uma boa análise.",
  ],
  kk: [
    "Kkkkk pronto, pelo menos alguém nessa conversa reconhece uma boa análise.",
    "Riu, né? Eu sabia que esse argumento tinha potencial.",
  ],
  kkk: [
    "Kkkkk pronto, pelo menos alguém nessa conversa reconhece uma boa análise.",
    "Riu, né? Eu sabia que esse argumento tinha potencial.",
  ],
  sim: [
    "Pois é. Eu ia falar isso, mas deixa eu manter a pose de quem chegou nessa conclusão sozinho.",
    "Sabia que você ia concordar. Quer dizer, eu esperava. Mais ou menos.",
  ],
  nao: [
    "Não? Tudo bem, vou fingir que você está pensando melhor no assunto.",
    "Aí você me complica. Mas continuo achando meu argumento muito sólido.",
  ],
  "bom dia": [
    "Bom dia! Já tomou café? Sem café ninguém está preparado pra discussão séria.",
    "Bom dia! A conversa começa bem, agora só falta você concordar comigo.",
  ],
  "boa tarde": ["Boa tarde! Chegou na hora certa: eu estava prestes a explicar um negócio."],
  "boa noite": ["Boa noite! Eu ia encerrar o grupo, mas essa conversa ainda pode render."],
  pois: ["Pois é. Finalmente alguém acompanhando o raciocínio — ou pelo menos fazendo essa cara."],
  entendi: ["Ótimo. Não vou repetir tudo, só mais uma vez pra garantir."],
  calma: ["Tô calmo. Esse é meu tom normal quando estou absolutamente certo."],
};

function normalize(text: string) {
  return text
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getQuickReply(text: string, sequence: number): string | null {
  const normalized = normalize(text);
  const options = /^k{2,}$/.test(normalized)
    ? quickReplies.kkk
    : /^(ha){2,}h?$|^(he){2,}h?$/.test(normalized)
      ? quickReplies.kkk
      : quickReplies[normalized];
  return options ? options[sequence % options.length] : null;
}
