# Khulna University Physics Discipline Alumni Network

A minimalist, high-performance static web application for **Khulna University Physics Discipline Alumni**. Designed to help undergraduates and freshers connect with alumni pursuing higher studies in **Study Abroad & Research** programs and leading careers in **Tech, Data & AI**.

## Key Features

- **Minimalist Aesthetic**: Off-white background (`#FAFAFA`) with crisp black typography and clean borders.
- **Two Exclusive Segments**:
  1. **Study Abroad & Research** (PhD & Master scholars at Cambridge, Max Planck, UT Austin, Kyoto University, etc.)
  2. **Tech, Data & AI** (Lead Data Scientists, DevOps Engineers, ML Researchers, Software Architects)
- **Zero Emojis**: Clean, professional UI.
- **Admin-Protected Profile Management**: The *"Join Network"* button requires an Admin Passcode (`kuphysics2026`).
- **Database-Free Architecture**: Runs 100% serverless on GitHub Pages. Images uploaded by the admin are converted into direct data/URLs and can be exported as `alumni-data.js` to commit straight to GitHub!

---

## How to Deploy to GitHub Pages

Since this website uses vanilla HTML, CSS, and JavaScript with zero backend or database dependencies, it can be deployed on GitHub Pages in 2 minutes for free:

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and click **New Repository**.
2. Name your repository `ku-physics-alumni` (or any name you prefer).
3. Keep it **Public** and do not add a README (since this repository already has one).

### Step 2: Push your Code to GitHub
In your local command prompt or terminal inside the project directory, run:

```bash
git init
git add .
git commit -m "Initial commit of KU Physics Alumni Network"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ku-physics-alumni.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your GitHub repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Within 1-2 minutes, your website will be live at:
   `https://YOUR_GITHUB_USERNAME.github.io/ku-physics-alumni/`

---

## Admin Access & Image Uploads (No Database)

- **Default Admin Passcode**: `kuphysics2026`
- **Adding Profiles**:
  1. Click **Join Network (Admin)** in the top navigation bar.
  2. Enter passcode `kuphysics2026`.
  3. Upload an image file from your computer or paste an image URL.
  4. Click **Save & Publish Profile** to instantly update the live view.
  5. Click **Export JSON Data** to download the updated `alumni-data.js` file, which you can commit to your GitHub repository to make changes permanent across all devices!
