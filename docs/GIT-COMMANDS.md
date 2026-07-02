# Git Commands — Push HelpDesk Lite to GitHub

Commit the project in a few grouped commits (one per area) on the **`dev`** branch.
Copy/paste each block in order. These are instructions — nothing is run for you.

---

## 0. Create and switch to the `dev` branch

```bash
git checkout -b dev
```

## 1. Project config (gitignore, readme, plan)

```bash
git add .gitignore README.md plan.md
git commit -m "chore: add gitignore, readme and project plan"
git push origin dev
```

## 2. Design documentation — all files in one commit

```bash
git add docs
git commit -m "docs: add technical design documentation"
git push origin dev
```

## 3. Backend API (NestJS)

```bash
git add helpdesk-api
git commit -m "feat(api): add NestJS helpdesk backend"
git push origin dev
```

## 4. Frontend web app (Next.js)

```bash
git add helpdesk-web
git commit -m "feat(web): add Next.js helpdesk frontend"
git push origin dev
```

---

### Notes

- `.gitignore` keeps `node_modules/`, build output, and real `.env` files out of git,
  while `.env.example` files are committed on purpose.
- If the `dev` branch already exists, use `git checkout dev` instead of `git checkout -b dev`.
- To push everything in a single commit instead, replace steps 1–4 with:

  ```bash
  git checkout -b dev
  git add .
  git commit -m "feat: add HelpDesk Lite prototype (api, web, docs)"
  git push origin dev
  ```
