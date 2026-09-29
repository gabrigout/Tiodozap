import type { Topic } from "./types";

export const topicResponses: Record<Topic, string[]> = {
  politica: [
    "Eu votei no Bolsonaro, sim. Não quer dizer que concordo com cada coisa que qualquer político fala; agora, se você vier com argumento bom, vou ter que fingir que o sinal caiu.",
    "Política é igual churrasqueira: quem entende mesmo fica quieto olhando o carvão. Agora, quem me mandou aquele vídeo de 14 minutos...",
    "Eu tenho uma teoria muito bem fundamentada por um áudio que chegou sem nome. Coincidência? No grupo ninguém acha.",
    "Isso aí é um assunto complexo. Inclusive, você viu o preço do tomate? Aí está a verdadeira crise institucional.",
    "Meu amigo que acompanha essas coisas — ele vê televisão com o volume bem alto — explicou tudo em três figurinhas.",
  ],
  futebol: [
    "Sou Palmeiras até no dia ruim. Principalmente no dia ruim: no bom todo mundo aparece com a camisa, quero ver defender no grupo depois de um empate.",
    "O Palmeiras perdeu? Calma. Campeonato se decide no fim. O juiz, o gramado e a tabela podem ter opiniões diferentes, mas eu não.",
    "No futebol é simples: se ganhou, foi estratégia; se perdeu, o juiz e a bola estavam claramente combinados.",
    "Eu não sou técnico, mas já mudei a escalação inteira no sofá. O treinador devia me ouvir pelo pensamento.",
    "Esse time precisa de raça. E de um lateral. E de um centroavante. Enfim, precisa trocar todo mundo, menos o meu palpite.",
  ],
  tecnologia: [
    "Tecnologia é ótima até pedir atualização bem na hora que eu ia mostrar um negócio importante. O aparelho sente.",
    "Eu mexo com tecnologia faz tempo: já reiniciei modem, televisão e uma conversa de família inteira.",
    "Esse aplicativo aí deve estar ouvindo tudo. Não que eu me importe, mas vou falar mais perto do roteador.",
  ],
  "inteligencia-artificial": [
    "Inteligência artificial? Na minha época a artificial era a desculpa do primo quando não queria lavar a louça.",
    "Essa IA fala bonito, mas queria ver responder no grupo da família depois de alguém mandar 'bom dia' com 32 flores.",
    "Eu também tenho inteligência artificial: artificial porque é feita de artifício. Não precisa pesquisar, eu já pesquisei por você.",
  ],
  comida: [
    "Comida de verdade não precisa de receita: você põe um pouco de cada coisa e depois culpa a panela.",
    "Todo mundo fala de dieta, mas nunca vi uma alface resolver um problema. Agora um pão de queijo, pelo menos melhora a reunião.",
    "Isso me lembra um restaurante que fui uma vez. Não lembro o nome, mas o garçom concordou comigo sobre política.",
  ],
  relacionamento: [
    "Relacionamento é igual Wi-Fi: quando funciona ninguém pergunta a senha, quando cai todo mundo vira especialista.",
    "Conselho amoroso eu dou de graça. Depois não me responsabilizo se a pessoa resolver conversar e estragar a minha teoria.",
    "O segredo é sempre ouvir. Eu, por exemplo, ouço tudo. Aí explico o que a pessoa quis dizer de verdade.",
  ],
  trabalho: [
    "No trabalho eu aprendi uma coisa: se ninguém sabe quem fez, provavelmente foi resolvido. Não mexe que está dando certo.",
    "Reunião podia ser um áudio de 40 segundos. Ou uma mensagem minha de 12 minutos explicando por que áudio é melhor.",
    "Trabalhar em equipe é importante. Principalmente quando a equipe reconhece que a minha ideia já estava certa desde o começo.",
  ],
  dinheiro: [
    "Dinheiro não traz felicidade, mas paga o mercado. E o mercado hoje em dia é quase um teste de caráter.",
    "Eu tenho um método de economia infalível: não olho o extrato. Se não olhei, não tive prejuízo confirmado.",
    "Investimento bom é aquele que um conhecido fez antes de virar assunto no grupo. Depois eu explico como eu teria feito.",
  ],
  aleatorio: [
    "Interessante você falar disso. Meu vizinho tinha um cachorro que fazia uma coisa parecida. Ou talvez fosse o cunhado dele.",
    "Eu sabia que esse assunto ia aparecer. Não sabia quando, nem por quê, mas sabia. Tenho um faro que não cabe numa planilha.",
    "A questão é mais profunda do que parece. Inclusive, falando em profundidade, você viu como está funda a discussão no grupo?",
  ],
};

export const genericResponses = [
  "Então, deixa eu te explicar uma coisa que ninguém está explicando: isso depende. Depende de quem contou e de quem estava no grupo.",
  "Eu entendi o que você quis dizer. Quer dizer, entendi o que você deveria ter querido dizer. É diferente.",
  "Pode até ser. Mas meu amigo que trabalha com isso falou outra coisa. Trabalha com o quê? Aí já é detalhe.",
  "Eu vi um vídeo explicando exatamente isso. Ou era sobre outra coisa? O importante é que o raciocínio serve.",
  "Anota aí: tenho quase certeza de que já conversei sobre isso com alguém. E eu geralmente lembro das partes importantes.",
  "Calma, deixa eu te explicar. Essa conversa tem mais camadas do que uma lasanha de domingo.",
];

export const sourceResponses = [
  "Fonte? Um conhecido mandou no grupo. Apaguei o nome pra proteger a identidade dele e também porque não lembro.",
  "Eu vi num vídeo. Tinha legenda, música de suspense e uma seta vermelha. Mais confiável que muito artigo por aí.",
  "A fonte é um instituto independente chamado 'meu amigo que trabalha com isso'. O relatório veio em áudio de 3 minutos.",
  "Manda a fonte você primeiro. A minha está aqui, só preciso achar entre os bom-dias e as fotos de gato.",
];

export const contradictionResponses = [
  "Não é contradição, é uma atualização de opinião em tempo real. Acontece com quem acompanha os fatos de perto.",
  "Você está tirando isso de contexto. O contexto está naquele áudio que eu não encaminhei ainda.",
  "Eu não falei isso desse jeito. Quer dizer, falei as palavras, mas o sentido era outro. Muito outro.",
  "Olha, quando eu falo uma coisa é análise. Quando parece o contrário, é uma estratégia de comunicação avançada.",
];

export const provocationResponses = [
  "Eu não vou discutir com quem não entende. Mas vou explicar mais uma vez porque sou uma pessoa muito paciente.",
  "Ataque pessoal é quando a pessoa percebe que o argumento do tio tem fundamento. Quer dizer, quase sempre.",
  "Fica tranquilo, eu não levo pro lado pessoal. Só vou lembrar disso na próxima ceia, com exemplos.",
];

export const topicChangeResponses = [
  "Tá, mas mudando de assunto: você já viu o preço do café? Aí sim estamos falando de um tema que interessa a todos.",
  "Falando nisso, lembrei de uma coisa completamente diferente que prova o que eu estava dizendo antes.",
  "Vamos deixar isso pra lá. Você viu aquele vídeo do cachorro que parece que está julgando todo mundo?",
];

export const irritationPrefixes = [
  "",
  "Calma, deixa eu te explicar: ",
  "Você está complicando uma coisa simples. ",
  "Eu já expliquei isso, mas vamos lá: ",
  "Não vou ficar discutindo isso com você, mas só mais uma coisa: ",
  "Última vez que eu falo: ",
];
