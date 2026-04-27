# STRATEX — Whitelabel Dashboard

> Tableau de bord de pilotage stratégique — Single Page Application 100 % côté client, sans backend.

[![Deploy to GitHub Pages](https://github.com/FromScratchStudio/Whitelabel-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/FromScratchStudio/Whitelabel-dashboard/actions/workflows/deploy.yml)

---

## 🌐 Démo en ligne

👉 [https://fromscratchstudio.github.io/Whitelabel-dashboard/](https://fromscratchstudio.github.io/Whitelabel-dashboard/)

---

## 📋 Description

**STRATEX Whitelabel Dashboard** est une application de pilotage stratégique pour startups et équipes projet. Elle est entièrement **whitelabel** : nom, tagline et couleur d'accentuation sont personnalisables depuis les réglages et se propagent à toute l'interface.

Toutes les données sont persistées dans le `localStorage` du navigateur — aucun backend, aucune base de données distante.

### Fonctionnalités principales

| Vue | Description |
|---|---|
| **Dashboard** | Vue synthétique : résumé des KPIs, tâches actives, avancement global |
| **Pipeline** | Kanban de livrables par étape (colonnes personnalisables) |
| **Projects** | Liste des projets avec statut, priorité et progression |
| **KPIs** | Objectifs sur 3 horizons (3 mois, 12 mois, 36 mois) avec suivi de valeur actuelle |
| **Roadmap** | Phases et tâches avec avancement par phase |
| **Ideas** | Pipeline d'idées Raw → Sorted → Selected |
| **Planning** | Plan trimestriel en texte libre |
| **Principles** | Principes opérationnels conditionnels (Si… Alors…) |
| **Referentiel** | Répertoire des entités clés (équipe, investisseurs, clients, conseillers) |
| **Settings** | Personnalisation du nom, tagline et couleur d'accentuation |

---

## 🛠 Stack technique

| Élément | Choix |
|---|---|
| Framework UI | React 18 |
| Langage | TypeScript 5 |
| Bundler | Vite 5 |
| State management | Zustand 5 (middleware `persist` → `localStorage`) |
| Styles | CSS-in-JS inline (`React.CSSProperties`) |
| Fonts | Google Fonts : DM Serif Display, JetBrains Mono |
| Routing | Aucun — navigation par état Zustand (`activeView`) |
| Déploiement | GitHub Pages via GitHub Actions |

---

## 🗂 Architecture

```
src/
├── main.tsx              # Point d'entrée React
├── App.tsx               # Shell : TopBar + vue active
├── theme.ts              # Constantes couleurs et polices
├── index.css             # Reset CSS minimal
├── types/index.ts        # Tous les types TypeScript
├── data/seed.ts          # Données initiales du store
├── store/useStore.ts     # Store Zustand unique
└── components/
    ├── layout/TopBar.tsx
    ├── ui/               # Badge, Card, ProgressBar, SectionTitle
    └── views/            # Une vue par section
```

**Règles clés :**
- Les composants de vue ne reçoivent pas de props — ils lisent directement le store.
- Toutes les mutations passent par les actions du store.
- Les IDs sont générés avec `Date.now()`.

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
git clone https://github.com/FromScratchStudio/Whitelabel-dashboard.git
cd Whitelabel-dashboard
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5174](http://localhost:5174).

### Build de production

```bash
npm run build
```

Le bundle de production est généré dans le dossier `dist/`.

### Vérification des types

```bash
npm run typecheck
```

---

## 📦 Déploiement

Le déploiement est automatisé via GitHub Actions (`.github/workflows/deploy.yml`).

- **Déclencheur** : chaque push sur la branche `main`
- **Étapes** : vérification des types → build → publication sur GitHub Pages

---

## 🎨 Personnalisation (Whitelabel)

Depuis la vue **Settings**, vous pouvez modifier :

- **Nom de l'application** (ex : `STRATEX`)
- **Tagline** (ex : `Strategic Execution Framework`)
- **Couleur d'accentuation** (ex : `#c9a84c`)

Ces paramètres se propagent instantanément à toute l'interface et sont persistés dans le `localStorage`.

---

## 📄 Documentation

La spécification technique complète (modèle de données, comportements, charte graphique) est disponible dans [`SPEC.md`](./SPEC.md).

---

## 📝 Licence

Ce projet est la propriété de [FromScratch Studio](https://github.com/FromScratchStudio).