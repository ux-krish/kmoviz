<div align="center">

# 🎬 KMOVIZ PRO
### *Ultra 4K Cinema Streaming & Live Entertainment Platform*

[![Vite](https://img.shields.io/badge/Vite-8.2+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-e50914?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)

**KMOVIZ** is a next-generation streaming web application designed to deliver an ad-free, ultra-fast 4K cinema experience for brand new movies, TV series, and regional blockbusters.

[🚀 **Live Demo on GitHub Pages**](https://ux-krish.github.io/kmoviz/) • [✨ Features](#-key-features) • [⚡ Getting Started](#-getting-started) • [📦 Deployment](#-github-pages-deployment)

</div>

---

## 🌟 Key Features

### 🍿 1. Brand New 2026–2025 Movie Catalog
- **Live TMDB Integration**: Automatically queries and curates the newest in-theater and on-demand movies, including *Spider-Man: Brand New Day*, *Toy Story 5*, and trending Hollywood/Bollywood releases.
- **Top 10 Billboard Rotation**: Dynamically showcases the top 10 daily trending movies with custom 2-minute auto-rotations and smooth cinematic transitions.

### 🎥 2. Universal Cinema Player & Multi-Server Switching
- **Multi-Server Engine**:
  - **Server 1 — VidSrc Pro (vsembed)**: Ultra-fast 4K streaming with zero sandbox restrictions.
  - **Server 2 — VidSrc Classic (vidsrc.me)**: Clean fallback stream for movies and episodic TV series.
- **Direct Stream Launcher**: Enter any valid IMDB ID (`tt...`) or TMDB ID to immediately launch full movies or select specific TV seasons and episodes.
- **Auto-Resume & History**: Remembers your exact watch progress and prompts you to resume where you left off.

### 🛡️ 3. In-App ClickShield & Ad Interception
- **Smart Click Interception**: Blocks rapid-fire invisible ad click overlays, popunders, and middle-click redirects while ensuring video playback controls respond seamlessly.
- **DNR-Style Network Shield**: Built-in Service Worker engine that suppresses 400+ ad and tracker network requests without breaking stream playback.

### 🎲 4. "Surprise Me" AI Vibe Picker
- Overcomes decision fatigue by analyzing mood categories (*Hot New Releases, Adrenaline Action, Mind-Bending Sci-Fi, Laugh Out Loud, Drama & Romance, Dark Crime & Mystery*) to instantly serve the highest-matching movie recommendation.

### 📑 5. My List & Continue Watching Library
- **Personalized Watchlist**: Save favorites with a single click (turns into a glowing green checkmark).
- **Category Filter Pills**: Filter saved items by *All*, *Movies*, or *TV Shows*.
- **Local Persistence**: All watch history, ratings, and lists are stored locally in your browser.

### 🎨 6. Ultra-Legendary Netflix/Prime Inspired UI
- Universal **2:3 Vertical Cinema Poster Cards** with real-time match rates, 4K UHD tags, gold star ratings, and hover action trays.
- Smooth horizontal drag-and-scroll sliders.
- Fully responsive design crafted with clean SCSS and GSAP micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling & Design System** | Modern SCSS (Modular Sass architecture, CSS Grid, Glassmorphism) |
| **Animation Engine** | [GSAP 3](https://greensock.com/gsap/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Metadata & Catalog APIs** | TMDB API v3, MetaHub Space, vsembed API |
| **Deployment** | GitHub Pages & GitHub Actions Workflow |

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ux-krish/kmoviz.git
   cd kmoviz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📦 GitHub Pages Deployment

### Option A: Automatic Deployment (Recommended)
This repository includes a ready-to-use GitHub Actions workflow located at `.github/workflows/deploy.yml`.

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/ux-krish/kmoviz.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` will automatically build and publish your app to:
   ```
   https://ux-krish.github.io/kmoviz/
   ```

### Option B: Manual CLI Deployment
To deploy directly from your local terminal using the `gh-pages` script:
```bash
npm run deploy
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ for cinema lovers worldwide by the KMOVIZ Team.</sub>
</div>
