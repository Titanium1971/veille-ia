import { fetchAll } from "./sources.mjs";
import { summarize } from "./agent.mjs";
import { sendDigest } from "./email.mjs";

function parseArgs(argv) {
  const args = { dryRun: false, slot: "morning" };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--evening") args.slot = "evening";
    else if (a === "--morning") args.slot = "morning";
  }
  if (!args.dryRun) {
    const hourUtc = new Date().getUTCHours();
    args.slot = hourUtc >= 12 ? "evening" : "morning";
  }
  return args;
}

function checkEnv(dryRun) {
  const auth = process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
  if (!auth) {
    console.error("Manque CLAUDE_CODE_OAUTH_TOKEN (recommandé pour Max) ou ANTHROPIC_API_KEY.");
    console.error("Pour générer un token Max headless : `claude setup-token` en local, puis stocker la sortie en secret GitHub.");
    process.exit(1);
  }
  if (!dryRun && !process.env.RESEND_API_KEY) {
    console.error("Manque RESEND_API_KEY (obtenir une clé gratuite sur resend.com).");
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  checkEnv(args.dryRun);

  console.log(`[veille] slot=${args.slot} dryRun=${args.dryRun}`);
  console.log("[veille] fetch sources…");
  const bundle = await fetchAll();
  const counts = {
    arxiv: bundle.arxiv.length,
    hf: bundle.hf.length,
    blogs: bundle.blogs.length,
    newsletters: bundle.newsletters.length,
  };
  console.log("[veille] items récupérés :", counts);

  console.log("[veille] summarize via Claude Agent SDK…");
  const t0 = Date.now();
  const md = await summarize(bundle);
  console.log(`[veille] summarize ok (${((Date.now() - t0) / 1000).toFixed(1)}s, ${md.length} chars)`);

  console.log("[veille] envoi email…");
  const res = await sendDigest(md, { slot: args.slot, dryRun: args.dryRun });
  console.log("[veille] done", res);
}

main().catch((err) => {
  console.error("[veille] FAIL:", err);
  process.exit(1);
});
