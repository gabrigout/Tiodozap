import type { ChatAIReply } from "./providerTypes";

const CACHE_KEY = "tiominion-reply-cache-v1";
const CACHE_LIMIT = 50;
const CACHE_TTL = 24 * 60 * 60 * 1000;
const contextDependent = /\b(isso|aquilo|ele|ela|eles|elas|esse|essa|aquele|aquela|ontem|hoje|agora|noticia|jogo|preco|lei|eleicao)\b/;

type CacheEntry = {
  text: string;
  savedAt: number;
};

type ReplyCache = Record<string, CacheEntry>;

function normalize(text: string) {
  return text
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readCache(): ReplyCache {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, CacheEntry] =>
          typeof entry[1] === "object" &&
          entry[1] !== null &&
          "text" in entry[1] &&
          typeof entry[1].text === "string" &&
          "savedAt" in entry[1] &&
          typeof entry[1].savedAt === "number",
      ),
    );
  } catch (error) {
    console.warn("Não foi possível ler o cache de respostas.", error);
    return {};
  }
}

function cacheKey(text: string) {
  const normalized = normalize(text);
  if (normalized.length < 12 || normalized.length > 240 || contextDependent.test(normalized)) {
    return null;
  }
  return normalized;
}

export function getCachedReply(text: string): ChatAIReply | null {
  const key = cacheKey(text);
  if (!key) return null;
  const cache = readCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.savedAt > CACHE_TTL) {
    delete cache[key];
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Não foi possível atualizar o cache de respostas.", error);
    }
    return null;
  }
  return { text: entry.text, sources: [] };
}

export function cacheReply(text: string, reply: ChatAIReply) {
  const key = cacheKey(text);
  if (!key || reply.sources.length > 0) return;

  const cache = readCache();
  cache[key] = { text: reply.text, savedAt: Date.now() };
  const recentEntries = Object.entries(cache)
    .filter(([, entry]) => Date.now() - entry.savedAt <= CACHE_TTL)
    .sort((left, right) => right[1].savedAt - left[1].savedAt)
    .slice(0, CACHE_LIMIT);
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(recentEntries)));
  } catch (error) {
    console.warn("Não foi possível salvar a resposta no cache.", error);
  }
}
