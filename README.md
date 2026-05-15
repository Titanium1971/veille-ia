# Veille IA

Agent de veille IA quotidienne. Cron 2x/jour via GitHub Actions, agrégation RSS multi-sources, résumé en français par Claude (Agent SDK), envoi par email via Resend.

## Sources

- arXiv RSS (cs.AI, cs.CL, cs.LG)
- HuggingFace (modèles trending)
- Blogs labs : Anthropic, OpenAI, DeepMind, Mistral
- Newsletters : Simon Willison, Latent Space

Configurable dans `scripts/config.mjs`.

## Setup

1. **Installer les deps localement** (pour tester) : `npm install`
2. **Générer un token OAuth Max headless** : `claude setup-token` sur ton laptop, copier la sortie
3. **Configurer les secrets GitHub** (Settings → Secrets and variables → Actions) :
   - `CLAUDE_CODE_OAUTH_TOKEN` (le token Max — qualifie pour le crédit Agent SDK $200/mois à partir du 15 juin)
     - Fallback : `ANTHROPIC_API_KEY` (facturé sur les credits API console)
   - `RESEND_API_KEY` (clé gratuite sur [resend.com](https://resend.com), 100 mails/jour)
   - `EMAIL_TO` (adresse de destination, défaut : `ccdeveloppement@gmail.com`)
   - `EMAIL_FROM` (optionnel, défaut : `Veille IA <onboarding@resend.dev>` — sandbox Resend)

## Test local

```bash
export CLAUDE_CODE_OAUTH_TOKEN=...   # ou ANTHROPIC_API_KEY=...
npm run veille:dry                    # dry-run, pas d'envoi
```

## Test depuis GitHub UI

Onglet **Actions → Veille IA → Run workflow** avec `dry_run = true` pour valider sans envoyer.

## Schedule

- Cron `0 5,16 * * *` UTC = 7h / 18h Paris (été), 6h / 17h Paris (hiver)
- Modifiable dans `.github/workflows/veille-ia.yml`

## Coût estimé

- ~0,30-0,60 $ par run via Sonnet
- ~15-25 $/mois pour 2 runs/jour
- Couvert intégralement par le crédit Max Agent SDK 200 $/mois (à partir du 15 juin)
