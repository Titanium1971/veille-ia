import Parser from "rss-parser";
import { SOURCES, TIME_WINDOW_HOURS, MAX_ITEMS_PER_SOURCE } from "./config.mjs";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "veille-ia/1.0 (+cyril)" },
});

function itemDate(item) {
  return (
    item.isoDate ||
    item.pubDate ||
    item["dc:date"] ||
    item.updated ||
    item.published
  );
}

function isRecent(item, hours = TIME_WINDOW_HOURS) {
  const ts = itemDate(item);
  if (!ts) return false;
  const age = Date.now() - new Date(ts).getTime();
  return age < hours * 60 * 60 * 1000;
}

function sortDescAndCap(items, cap = MAX_ITEMS_PER_SOURCE) {
  return items
    .slice()
    .sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    })
    .slice(0, cap);
}

async function safeParse(url, label) {
  try {
    return await parser.parseURL(url);
  } catch (err) {
    console.warn(`[veille] fetch fail ${label || url}: ${err.message}`);
    return { items: [] };
  }
}

function normalize(item, source) {
  return {
    source,
    title: (item.title || "").trim(),
    url: item.link || item.guid,
    summary: (item.contentSnippet || item.content || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500),
    date: item.isoDate || item.pubDate,
  };
}

async function fetchArxiv() {
  const feeds = await Promise.all(
    SOURCES.arxiv.map((u) => safeParse(u, `arXiv ${u.split("/").pop()}`))
  );
  const items = feeds.flatMap((f) =>
    (f.items || []).filter(isRecent).map((i) => normalize(i, "arXiv"))
  );
  return sortDescAndCap(items);
}

async function fetchHF() {
  try {
    const res = await fetch(SOURCES.hfTrendingUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HF API ${res.status}`);
    const models = await res.json();
    return models.slice(0, 15).map((m) => {
      const id = m.modelId || m.id;
      return {
        source: "HuggingFace",
        title: id,
        url: `https://huggingface.co/${id}`,
        summary: `Tags: ${(m.tags || []).slice(0, 6).join(", ") || "(aucun)"} — Downloads: ${m.downloads ?? "?"}, Likes: ${m.likes ?? "?"}`,
        date: m.lastModified,
      };
    });
  } catch (err) {
    console.warn(`[veille] HF: ${err.message}`);
    return [];
  }
}

async function fetchFeedList(list) {
  const results = await Promise.all(
    list.map(async ({ name, url }) => {
      const feed = await safeParse(url, name);
      const items = (feed.items || [])
        .filter(isRecent)
        .map((i) => normalize(i, name));
      return sortDescAndCap(items);
    })
  );
  return results.flat();
}

export async function fetchAll() {
  const [arxiv, hf, blogs, newsletters] = await Promise.all([
    fetchArxiv(),
    fetchHF(),
    fetchFeedList(SOURCES.blogs),
    fetchFeedList(SOURCES.newsletters),
  ]);
  return { arxiv, hf, blogs, newsletters };
}
