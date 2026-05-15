export const INTERESTS = `
Profil de l'utilisateur (Cyril) :
- Écosystème Claude / Anthropic : releases, features, Claude Agent SDK, MCP, prompt caching, optimisation coût
- Développement d'agents IA : frameworks, patterns d'orchestration, sécurité, evals, observabilité
- Modèles open-source notables : small models, fine-tuning, inference, quantization (HuggingFace)
- Stack dev : Next.js, React, Cloudflare, Supabase, Vercel, TypeScript, MCP, Make
- Business / no-code : agents commerciaux, micro-SaaS bâtis sur LLM, acquisition de SaaS
- Techniques économiques d'usage LLM : caching, modèles mixtes (Haiku/Sonnet/Opus), batching
`;

export const SOURCES = {
  arxiv: [
    "http://export.arxiv.org/rss/cs.AI",
    "http://export.arxiv.org/rss/cs.CL",
    "http://export.arxiv.org/rss/cs.LG",
  ],
  hfTrendingUrl:
    "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=15",
  blogs: [
    { name: "Anthropic", url: "https://www.anthropic.com/rss.xml" },
    { name: "OpenAI", url: "https://openai.com/blog/rss.xml" },
    { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
    { name: "Mistral AI", url: "https://mistral.ai/news/rss.xml" },
  ],
  newsletters: [
    { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
    { name: "Latent Space", url: "https://www.latent.space/feed" },
  ],
};

export const TIME_WINDOW_HOURS = 24;
export const MAX_ITEMS_TO_SUMMARIZE = 8;

export const EMAIL_FROM = process.env.EMAIL_FROM || "Veille IA <onboarding@resend.dev>";
export const EMAIL_TO = process.env.EMAIL_TO || "ccdeveloppement@gmail.com";
