import { query } from "@anthropic-ai/claude-agent-sdk";
import { INTERESTS, MAX_ITEMS_TO_SUMMARIZE } from "./config.mjs";

const SYSTEM_PROMPT = `Tu es l'assistant de veille IA quotidienne de Cyril.

${INTERESTS}

MISSION
Étant donné une liste brute d'items de veille (papers arXiv, modèles HuggingFace, articles de blogs labs, newsletters), tu dois :

1. Sélectionner les ${MAX_ITEMS_TO_SUMMARIZE} items les plus pertinents pour Cyril (qualité + intérêt thématique + nouveauté).
2. Pour chaque sélectionné, écrire 2-3 phrases en FRANÇAIS qui expliquent CE QUE C'EST et POURQUOI c'est intéressant POUR LUI.
3. Regrouper par section : "Anthropic & Claude", "Modèles & Recherche", "Outils & Plateformes", "Business & Patterns". Ne mentionne pas une section vide.
4. Inclure pour chaque item un lien Markdown vers la source.

CONTRAINTES
- Réponds UNIQUEMENT en Markdown, prêt à être converti en HTML d'email.
- Pas de préambule "Voici la veille…". Commence directement par "## " de la première section.
- Ignore le bruit : politique, crypto, marketing pur, annonces commerciales sans contenu technique.
- Si moins de ${MAX_ITEMS_TO_SUMMARIZE} items sont vraiment dignes d'intérêt, ne force pas le quota.`;

function formatItems(items) {
  return items
    .map(
      (it, i) =>
        `[${i + 1}] ${it.source} — ${it.title}\n  URL: ${it.url}\n  ${it.summary || "(pas d'extrait)"}`
    )
    .join("\n\n");
}

export async function summarize(bundle) {
  const items = [...bundle.arxiv, ...bundle.hf, ...bundle.blogs, ...bundle.newsletters];

  if (items.length === 0) {
    return "_Aucune nouveauté détectée sur les sources surveillées dans la dernière fenêtre._";
  }

  const userPrompt = `Items à analyser (${items.length} bruts) :\n\n${formatItems(items)}`;

  const q = query({
    prompt: userPrompt,
    options: {
      model: "sonnet",
      systemPrompt: SYSTEM_PROMPT,
      tools: [],
      permissionMode: "bypassPermissions",
      env: {
        ...process.env,
        CLAUDE_AGENT_SDK_CLIENT_APP: "veille-ia-cyril/1.0",
      },
    },
  });

  let output = "";
  let errored = null;
  for await (const msg of q) {
    if (msg.type === "assistant") {
      if (msg.error) errored = msg.error;
      for (const block of msg.message?.content ?? []) {
        if (block.type === "text") output += block.text;
      }
    }
  }

  if (!output && errored) throw new Error(`Agent SDK error: ${errored}`);
  return output || "_Le modèle n'a pas produit de réponse._";
}
