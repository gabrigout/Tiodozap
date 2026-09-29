# TioMinion

Uma conversa de grupo de família, sem o grupo de família. O TioMinion é um personagem fictício de humor e sátira: opinativo, insistente e dono de umas fontes bastante criativas. Ele não representa uma pessoa real nem qualquer político específico.

## Testar no navegador

O site publicado fica em https://gabrigout.github.io/Tiodozap/. Cada atualização enviada para a branch `main` é publicada automaticamente pelo GitHub Actions; a atualização pode levar alguns minutos para aparecer.

## Ativar respostas com IA

O chat usa o Gemini 3.8 Flash pela Interactions API diretamente do navegador para entender e responder levando em conta as mensagens anteriores. Sem chave configurada, o modo local de respostas continua disponível. As interações são enviadas sem armazenamento server-side (`store: false`).

Quando há uma referência ambígua ou um fato que pode ter mudado, o Gemini pode decidir usar a pesquisa integrada do Google antes de responder. Mensagens simples não precisam de pesquisa; links usados como contexto aparecem discretamente abaixo da resposta.

Se a API ficar sem cota, atingir um limite ou ficar temporariamente indisponível, TioMinion encerra a conversa com uma despedida humorística em vez de exibir um erro técnico. O encerramento fica salvo nesta conversa; use **Nova conversa** para recomeçar.

Erros de configuração da chave ou do modelo não encerram o chat: aparece um aviso amigável com a opção **Tentar novamente**.

1. Gere uma chave para a Gemini API no Google AI Studio.
2. No GitHub, abra **Settings → Secrets and variables → Actions → New repository secret**.
3. Crie o segredo `GEMINI_API_KEY` com a chave.
4. Execute novamente o workflow **Deploy to GitHub Pages**, na aba **Actions**.

Para desenvolvimento local, copie `.env.example` para `.env.local`, preencha `VITE_GEMINI_API_KEY` e rode `npm run dev`.

**Importante:** por ser um site estático, a chave usada pelo navegador pode ser vista pelos visitantes. Restrinja a chave à Gemini API e ao domínio do site e configure limites de uso no Google Cloud. Chamadas à API podem estar sujeitas a limites ou cobrança conforme a conta e o uso.

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

- Conversa local baseada em regras, palavras-chave e contexto, sem IA ou serviços externos.
- Histórico, assuntos, estado da conversa e conquistas salvos no `localStorage` deste navegador.
- Use **Nova conversa** para apagar o histórico salvo e começar de novo.

As respostas são humorísticas e inventadas; não devem ser interpretadas como informação factual.
