import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_TO } from "./config.mjs";

function mdToHtml(md) {
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }
    let h = line;
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/`([^`]+)`/g, "<code>$1</code>");

    if (/^## /.test(h)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 style="margin:24px 0 8px;font-size:18px;color:#111">${h.slice(3)}</h2>`;
    } else if (/^### /.test(h)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 style="margin:16px 0 6px;font-size:16px;color:#333">${h.slice(4)}</h3>`;
    } else if (/^[-*] /.test(h)) {
      if (!inList) { html += '<ul style="margin:8px 0;padding-left:20px">'; inList = true; }
      html += `<li style="margin:6px 0">${h.slice(2)}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p style="margin:8px 0;line-height:1.5">${h}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;color:#222">${html}</div>`;
}

function subjectFor(slot) {
  const now = new Date();
  const date = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", timeZone: "Europe/Paris" });
  const label = slot === "evening" ? "soir" : "matin";
  return `Veille IA — ${date} (${label})`;
}

export async function sendDigest(markdown, { slot = "morning", dryRun = false } = {}) {
  const subject = subjectFor(slot);
  const html = mdToHtml(markdown);

  if (dryRun) {
    console.log("[veille] DRY RUN — pas d'envoi. Sujet :", subject);
    console.log("---\n", markdown, "\n---");
    return { dryRun: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY manquante");

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject,
    html,
    text: markdown,
  });
  if (error) throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  return data;
}
