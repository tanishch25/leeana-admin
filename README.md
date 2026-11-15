# Leeana Atelier · Studio Admin Desk

A standalone luxury content management portal for **Leeana Fashion Concierge** (`https://leeana.in`).

Hosted independently as a GitHub Pages application:
`https://tanishch25.github.io/leeana-admin/`

---

## How It Is Connected to the Live Site (`leeana.in`)

```
┌──────────────────────────────────────────────┐
│  LEEANA ADMIN DASHBOARD                      │
│  (https://tanishch25.github.io/leeana-admin) │
│  - Edit Reels & Videos                       │
│  - Edit Lookbook Plates                      │
│  - Edit Faces of Leeana (Models)             │
│  - Edit Client Reviews                       │
└──────────────────────┬───────────────────────┘
                       │
                       │ 1. One-Click Publish (GitHub API PUT)
                       ▼
┌────────────────────────────────────────────────────────┐
│  MAIN REPOSITORY (tanishch25/leeana-luxury-atelier)    │
│  File: leeana-luxury-atelier/public/atelierContent.json│
└──────────────────────┬─────────────────────────────────┘
                       │
                       │ 2. Live Auto-Sync on Mount & GitHub Pages Deploy
                       ▼
┌──────────────────────────────────────────────┐
│  LIVE STOREFRONT                             │
│  (https://leeana.in)                         │
│  Instantly renders updated content!          │
└──────────────────────────────────────────────┘
```

---

## 1. First-Time Setup on GitHub (1 Minute)

1. Open **[https://github.com/new](https://github.com/new)** in your browser.
2. Repository name: `leeana-admin`.
3. Select **Public**.
4. **Do not** check "Add a README file" (leave it empty).
5. Click **Create repository**.
6. In this folder, run:
   ```bash
   git push -u origin main
   ```
   *(Or double-click `push-to-github.bat`)*

7. In your new `leeana-admin` repository on GitHub:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
   - Your dashboard will be live at: **`https://tanishch25.github.io/leeana-admin/`**

---

## 2. Using the Dashboard

- **Passcode**: `2025`
- **Publishing**: Enter a GitHub Personal Access Token (PAT) with `repo: contents:write` permission. It will be remembered securely in your browser.
- Clicking **"Publish Live Changes Now"** commits directly to the main repository. Both the live raw sync and GitHub Actions rebuild will keep `https://leeana.in` completely updated!
