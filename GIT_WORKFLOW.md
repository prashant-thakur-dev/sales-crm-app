# LeadFlow — Git Branch Workflow

## Branch Structure

| Branch | Purpose | Who sees it |
|--------|---------|-------------|
| `main` | Production — stable, tested code | **Client via Vercel** |
| `dev`  | Development — your working branch | Only you (on GitHub) |

---

## Your Daily Workflow

### Step 1: Always work on `dev`
You are already on `dev` now. Every time you open this project to make changes, confirm you are on dev:
```bash
git branch
# should show: * dev
```
If not, switch to dev:
```bash
git checkout dev
```

---

### Step 2: Make changes, then save to `dev`
After making any changes (editing files, adding features, fixing bugs):
```bash
git add .
git commit -m "describe what you changed"
git push origin dev
```
✅ This saves your work safely to GitHub under `dev`. The client's live app is completely unaffected.

---

### Step 3: When you're satisfied — release to the client
When you are happy with the change and want the client to see it:
```bash
git checkout main
git merge dev
git push origin main
git checkout dev
```
That's it! Vercel auto-detects the push to `main` and deploys the new version to the client within ~60 seconds.

---

## Quick Reference Card

| What you want to do | Command |
|---|---|
| Check which branch you're on | `git branch` |
| Switch to dev (for daily work) | `git checkout dev` |
| Save changes to dev | `git add . && git commit -m "message" && git push origin dev` |
| Release changes to client | `git checkout main && git merge dev && git push origin main && git checkout dev` |

---

## Important Notes

> The client's Vercel deployment ONLY watches `main`. 
> Anything you push to `dev` — no matter how broken — will NEVER affect them.

> Always end the release command with `git checkout dev` so you automatically return  
> to the safe working branch for your next session.
