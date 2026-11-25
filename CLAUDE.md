# csschoolofdancedocusign

Guide for Claude (interactive sessions and the factory workflow).

## Stack
Next.js app router + jsPDF + signature canvas + Resend email.

## Before you change things, read
- README.md
- CUSTOMIZATION_GUIDE.md
- DEPLOYMENT_GUIDE.md

## Sensitive areas
Signed-document generation and emails to parents - verification must never send real email (leave RESEND key unset).

## Commands
```sh
# install
npm install
# checks (run all before every PR)
npm run lint
npm run build
# run
npm run dev  # http://localhost:3000; copy .env.example to .env.local
```

## Factory
Issues labelled `factory` run through `.claude/factory/BLUEPRINT.md` (triage -> spec -> implement -> verify -> merge risk -> PR).
Skills: `.claude/skills/factory-triage`, `verify-with-proof`, `merge-risk`. Use them in interactive sessions too.

## Verification gotchas
<!-- Append one line per lesson learned while verifying (ports, env vars, logins, flaky selectors). -->
