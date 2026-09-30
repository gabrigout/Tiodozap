# TioMinion

Uma conversa de grupo de família, sem o grupo de família. O TioMinion é um personagem fictício de humor e sátira: opinativo, insistente e dono de umas fontes bastante criativas. Ele não representa uma pessoa real nem qualquer político específico.

## Testar no navegador

O site publicado fica em https://gabrigout.github.io/Tiodozap/. Cada atualização enviada para a branch `main` é publicada automaticamente pelo GitHub Actions; a atualização pode levar alguns minutos para aparecer.

## Ativar respostas com IA

O chat usa o modelo `llama-3.3-70b-versatile` da Groq pela API compatível com OpenAI, diretamente do navegador, para responder levando em conta até 12 turnos recentes. Antes de cada pedido à IA, o indicador de digitação aparece por um intervalo aleatório de 5 a 10 segundos. Reações curtas (como “kkk”, “sim” e “bom dia”) recebem respostas locais imediatas; respostas de IA podem ser reutilizadas por até 24 horas para perguntas idênticas. Sem chave configurada, o modo local continua disponível.

Esta integração com a Groq não faz pesquisa na web nem fornece links de fontes. O personagem foi instruído a admitir quando não puder verificar informações atuais, em vez de inventar notícias ou referências.

Se a API atingir a cota, TioMinion dá uma despedida humorística e continua conversando com respostas locais até o usuário começar uma nova conversa. Falhas temporárias ou de configuração também recebem uma resposta local, sem encerrar o chat, e permitem tentar a IA novamente. O estado de irritação, as conquistas e o histórico ficam sob controle do frontend. A integração segue um contrato de provedor em `src/features/chat/providerTypes.ts`, para facilitar a troca futura por outro serviço.

Erros de configuração da chave ou do modelo não encerram o chat: aparece um aviso amigável com a opção **Tentar IA de novo**.

1. Gere uma chave no painel GroqCloud.
2. No GitHub, abra **Settings → Secrets and variables → Actions → New repository secret**.
3. Crie ou atualize o segredo `apigroqparatiozap` com a chave.
4. Execute novamente o workflow **Deploy to GitHub Pages**, na aba **Actions**.

Para desenvolvimento local, copie `.env.example` para `.env.local`, preencha `VITE_GROQ_API_KEY` e rode `npm run dev`.

**Importante:** por ser um site estático, a chave inserida em `VITE_GROQ_API_KEY` é incluída no JavaScript público e pode ser extraída por visitantes. Uma GitHub Actions Secret protege a chave no repositório, mas não a esconde do navegador depois do deploy. Para manter a chave privada, será necessário usar um backend/proxy; configure também limites de uso no painel GroqCloud.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Sobre o MVP

- Respostas locais baseadas em regras para o modo sem IA, com Groq opcional para conversas contextuais.
- Histórico, assuntos, estado da conversa, conquistas e cache de respostas salvos no `localStorage` deste navegador.
- Use **Nova conversa** para apagar o histórico salvo e começar de novo.

As respostas são humorísticas e inventadas; não devem ser interpretadas como informação factual.
