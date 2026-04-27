# STRATEX — Spécification de rétro-ingénierie

> Ce document décrit exhaustivement l'application STRATEX Whitelabel Dashboard afin de permettre à une IA de la reconstruire fonctionnellement et visuellement à l'identique.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Modèle de données](#4-modèle-de-données)
5. [Gestion d'état (Store)](#5-gestion-détat-store)
6. [Composants UI partagés](#6-composants-ui-partagés)
7. [Layout général](#7-layout-général)
8. [Vues — spécifications détaillées](#8-vues--spécifications-détaillées)
   - [Dashboard](#81-dashboard)
   - [Pipeline](#82-pipeline)
   - [Projects](#83-projects)
   - [KPIs](#84-kpis)
   - [Roadmap](#85-roadmap)
   - [Ideas](#86-ideas)
   - [Planning](#87-planning)
   - [Principles](#88-principles)
   - [Referentiel](#89-referentiel)
   - [Settings](#810-settings)
9. [Charte graphique & design system](#9-charte-graphique--design-system)
10. [Données de seed](#10-données-de-seed)
11. [Comportements transversaux](#11-comportements-transversaux)

---

## 1. Vue d'ensemble

STRATEX est un tableau de bord de pilotage stratégique **whitelabel** — une Single Page Application (SPA) entièrement côté client, sans backend ni base de données distante. Toutes les données sont persistées dans le `localStorage` du navigateur.

L'application permet à une équipe de startup ou de projet de :
- Suivre l'avancement des phases et tâches (Roadmap)
- Piloter un pipeline de livrables en mode Kanban
- Gérer des projets avec statut, priorité et progression
- Définir et mesurer des KPIs sur 3 horizons temporels (3 mois, 12 mois, 36 mois)
- Capturer et qualifier des idées (pipeline Raw → Sorted → Selected)
- Consigner le plan trimestriel (Planning)
- Définir des principes opérationnels conditionnels (Principles)
- Référencer les entités clés (équipe, investisseurs, clients, conseillers)
- Personnaliser le nom, la tagline et la couleur d'accentuation de l'app (Settings)

L'app est **whitelabel** : le nom, la tagline et la couleur d'accentuation sont modifiables dans les settings et se propagent à toute l'interface.

---

## 2. Stack technique

| Élément | Choix |
|---|---|
| Framework UI | React 18 (JSX/TSX) |
| Langage | TypeScript 5 |
| Bundler | Vite 5 |
| State management | Zustand 5 avec middleware `persist` |
| Persistance | `localStorage` via `createJSONStorage` de Zustand |
| Styles | CSS-in-JS inline (tous les styles sont des objets `React.CSSProperties`, pas de fichier CSS externe ni de framework CSS sauf `src/index.css` pour le reset global) |
| Fonts | Google Fonts : DM Serif Display (display), JetBrains Mono (mono), system-ui (body) |
| Routing | Aucun — navigation par état Zustand (`activeView`) |
| Tests | Aucun |
| Déploiement | GitHub Pages via GitHub Actions |

---

## 3. Architecture du projet

```
src/
├── main.tsx              # Point d'entrée React (ReactDOM.createRoot)
├── App.tsx               # Shell principal : TopBar + <main> avec vue active
├── theme.ts              # Constantes de couleurs (C) et de polices (FONT)
├── index.css             # Reset CSS minimal (margin:0, box-sizing:border-box, scrollbar styling)
├── types/
│   └── index.ts          # Tous les types TypeScript de l'application
├── data/
│   └── seed.ts           # Données initiales (utilisées comme valeurs par défaut du store)
├── store/
│   └── useStore.ts       # Store Zustand unique avec toutes les actions
└── components/
    ├── layout/
    │   └── TopBar.tsx    # Barre de navigation sticky
    ├── ui/
    │   ├── Badge.tsx     # Composant badge coloré
    │   ├── Card.tsx      # Conteneur carte
    │   ├── ProgressBar.tsx # Barre de progression
    │   └── SectionTitle.tsx # Titre de section avec accent coloré
    └── views/
        ├── DashboardView.tsx
        ├── PipelineView.tsx
        ├── ProjectsView.tsx
        ├── KPIsView.tsx
        ├── RoadmapView.tsx
        ├── IdeasView.tsx
        ├── PlanningView.tsx
        ├── PrinciplesView.tsx
        ├── ReferentielView.tsx
        └── SettingsView.tsx
```

**Règles d'architecture importantes :**
- Aucun composant de vue ne reçoit de props : ils lisent tous directement depuis le store Zustand.
- Toutes les actions de mutation passent par le store.
- Les IDs sont générés avec `Date.now()` au moment de la création (ex: `pi-${Date.now()}`).
- Chaque vue contient ses propres sous-composants de formulaire (inline dans le fichier de la vue).

---

## 4. Modèle de données

### 4.1 AppSettings
```ts
interface AppSettings {
  name: string;        // Nom de l'application (ex: "STRATEX")
  tagline: string;     // Sous-titre (ex: "Strategic Execution Framework")
  accentColor: string; // Couleur hex de l'accentuation (ex: "#c9a84c")
}
```

### 4.2 Category
```ts
interface Category {
  id: string;     // ex: "cat-core"
  label: string;  // Étiquette courte (ex: "Core")
  name: string;   // Nom complet (ex: "Core Product")
  color: string;  // Couleur hex
  pct: number;    // Allocation en % (0-100)
}
```

### 4.3 Phase (Roadmap)
```ts
interface PhaseTask {
  id: string;
  text: string;
  done: boolean;
}

interface Phase {
  id: string;
  label: string;    // ex: "Phase 1"
  name: string;     // ex: "Discovery"
  duration: string; // ex: "Months 1–3"
  accent: string;   // Couleur hex d'accentuation
  tasks: PhaseTask[];
}
```

### 4.4 PipelineStage & PipelineItem
```ts
interface PipelineStage {
  id: string;
  label: string;       // ex: "In Progress"
  description: string; // ex: "Actively being built"
  color: string;
  order: number;       // Ordre d'affichage dans le kanban
}

interface PipelineItem {
  id: string;
  title: string;
  stageId: string;     // Référence à PipelineStage.id
  categoryId: string;  // Référence à Category.id
  note: string;
  dueDate: string;     // Format ISO YYYY-MM-DD ou ""
}
```

### 4.5 Project
```ts
type ProjectStatus = "active" | "pending" | "backlog" | "done";
type ProjectPriority = "high" | "medium" | "low";

interface Project {
  id: string;
  name: string;
  categoryId: string;
  phaseId: string;
  status: ProjectStatus;
  progress: number;      // 0-100
  note: string;
  priority: ProjectPriority;
}
```

### 4.6 KpiDef & KpiValues
```ts
interface KpiDef {
  key: string;       // Identifiant unique (ex: "mrr")
  label: string;     // Libellé (ex: "MRR")
  target3m: number;  // Objectif à 3 mois
  target12m: number; // Objectif à 12 mois
  target36m: number; // Objectif à 36 mois
  unit: string;      // Unité (ex: "€", "%", "")
  icon: string;      // Emoji (ex: "📈")
}

// Les valeurs courantes sont stockées séparément
type KpiValues = Record<string, number>; // key → valeur actuelle
```

### 4.7 Idea
```ts
type IdeaStage = "raw" | "sorted" | "selected";

interface Idea {
  id: string;
  text: string;
  source: string;       // Origine (ex: "User feedback")
  stage: IdeaStage;
  project?: string;     // Nom de projet lié (optionnel)
  createdAt: string;    // Format YYYY-MM-DD
}
```

### 4.8 Planning
```ts
interface Planning {
  period: string;     // ex: "Q2 2026"
  objective: string;  // Objectif principal du trimestre
  arc: string;        // Arc stratégique
  arcEnd: string;     // Condition de fin de l'arc
  focalTool: string;  // Outil ou focus principal
  redZones: string;   // Périodes à risque / à éviter
  singleRule: string; // La règle unique du trimestre
}
```

### 4.9 Principle
```ts
interface Principle {
  id: string;
  name: string;    // ex: "Focus Mode"
  color: string;
  trigger: string; // Condition d'activation
  rules: string[]; // Liste de règles comportementales
  exit: string;    // Condition de sortie
}
```

### 4.10 Entity (Référentiel)
```ts
interface Entity {
  id: string;
  name: string;
  role: string;        // ex: "Internal", "Financial", "Customers"
  color: string;
  description: string;
  contact: string;
  tags: string[];
  notes: string;
}
```

### 4.11 Métriques de santé (scalaires dans le store)
```ts
energy: number;    // 1-10
focus: number;     // 1-10
momentum: number;  // 1-10
```

---

## 5. Gestion d'état (Store)

Le store est un singleton Zustand persisté dans `localStorage` sous la clé `"stratex-store"`.

### État initial
Toutes les données sont initialisées avec les valeurs de `src/data/seed.ts`.

### Navigation
```ts
activeView: ViewId  // "dashboard" | "pipeline" | "projects" | "kpis" | "roadmap" | "ideas" | "planning" | "principles" | "referentiel" | "settings"
setActiveView(v: ViewId): void
```

### Actions par entité

**Settings**
- `updateSettings(updates: Partial<AppSettings>): void`

**Categories**
- `addCategory(c: Category): void`
- `updateCategory(id, updates): void`
- `removeCategory(id): void`

**Phases**
- `addPhase(p: Phase): void`
- `updatePhase(id, updates): void` (sans modifier `tasks`)
- `removePhase(id): void`
- `addPhaseTask(phaseId, task: PhaseTask): void`
- `updatePhaseTask(phaseId, taskId, updates): void`
- `removePhaseTask(phaseId, taskId): void`
- `togglePhaseTask(phaseId, taskId): void` (inverse `done`)

**Pipeline**
- `addPipelineStage(s: PipelineStage): void`
- `updatePipelineStage(id, updates): void`
- `removePipelineStage(id): void`
- `addPipelineItem(item: PipelineItem): void`
- `updatePipelineItem(id, updates): void`
- `removePipelineItem(id): void`
- `movePipelineItem(id, stageId): void` (déplace un item vers une autre colonne)

**Projects**
- `addProject(p: Project): void`
- `updateProject(id, updates): void`
- `removeProject(id): void`

**KPIs**
- `addKpiDef(def: KpiDef): void`
- `updateKpiDef(key, updates): void`
- `removeKpiDef(key): void`
- `setKpiValue(key, value): void`

**Ideas**
- `addIdea(idea: Idea): void`
- `updateIdea(id, updates): void`
- `removeIdea(id): void`
- `advanceIdea(id): void` (raw → sorted → selected, sans effet si déjà selected)

**Planning**
- `updatePlanning(updates: Partial<Planning>): void`

**Principles**
- `addPrinciple(p: Principle): void`
- `updatePrinciple(id, updates): void` (sans modifier `rules`)
- `removePrinciple(id): void`
- `addPrincipleRule(id, rule: string): void`
- `updatePrincipleRule(id, index: number, rule: string): void`
- `removePrincipleRule(id, index: number): void`

**Entities**
- `addEntity(e: Entity): void`
- `updateEntity(id, updates): void`
- `removeEntity(id): void`

**Health**
- `setEnergy(v: number): void`
- `setFocus(v: number): void`
- `setMomentum(v: number): void`

---

## 6. Composants UI partagés

### Card
Conteneur générique avec fond `C.surface`, bordure `C.border`, border-radius 10px, padding 1rem.  
Props : `children`, `style?: React.CSSProperties`, `onClick?: () => void`.  
Curseur `pointer` si `onClick` est fourni.

### SectionTitle
Titre de section.  
Props : `children`, `accent: string` (couleur).  
Style : `fontFamily: FONT.mono`, `fontSize: 0.62rem`, `letterSpacing: 0.12em`, `textTransform: uppercase`, `color: accent`, `marginBottom: 0.75rem`.

### ProgressBar
Props : `value: number` (0-100), `color: string`, `height?: number` (défaut : 6px).  
Structure : conteneur gris (`C.border`) + barre intérieure de couleur `color`, `width: value%`, transitions douces, `borderRadius: 3px`.

### Badge
Props : `children`, `color: string`.  
Style : fond `color` à 15% d'opacité, bordure `color` à 40% d'opacité, texte `color`, `fontFamily: FONT.mono`, `fontSize: 0.58rem`, `borderRadius: 4px`, `padding: 0.1rem 0.45rem`.

---

## 7. Layout général

### Structure globale (App.tsx)
```
<div style="minHeight:100vh; background:C.bg; color:C.text; display:flex; flexDirection:column; fontFamily:FONT.body">
  <TopBar />                    ← sticky, zIndex:100
  <main style="flex:1; maxWidth:1440px; margin:0 auto; padding:1.5rem 1.25rem 3rem">
    {VIEW_COMPONENTS[activeView]}
  </main>
</div>
```

### TopBar
Structure verticale en deux lignes :

**Ligne 1 — Brand (hauteur 52px)**
- Carré coloré gradient (`accentColor → #f97316`, `borderRadius:6px`, `26×26px`)
- Nom de l'app (`FONT.display`, `1.1rem`, `color: accentColor`)
- Séparateur `|` en `C.textVeryDim`
- Tagline (`FONT.mono`, `0.62rem`, `C.textDim`, uppercase, `letterSpacing:0.12em`)

**Ligne 2 — Navigation (tabs)**
- Onglets horizontaux scrollables (`overflowX:auto`)
- 10 onglets : Dashboard, Pipeline, Projects, KPIs, Roadmap, Ideas, Planning, Principles, Referentiel, ⚙ Settings
- Style actif : `borderBottom: 2px solid accentColor`, `color: accentColor`
- Style inactif : `borderBottom: 2px solid transparent`, `color: C.textDim`
- Font : `FONT.mono`, `0.65rem`, `letterSpacing:0.08em`
- Fond du TopBar : `C.bgDeep`, bordure basse : `C.border`

---

## 8. Vues — spécifications détaillées

### 8.1 Dashboard

**Objectif** : Vue de synthèse en lecture seule (sauf sliders health).

**Structure (grille verticale) :**

**Bloc titre :**
- `h2` : nom de l'app (`FONT.display`, `1.4rem`, `C.text`)
- `p` : tagline (`FONT.mono`, `0.72rem`, `C.textDim`)

**Grille 2 colonnes :**
- **Colonne gauche — Health Check (Card)**
  - Titre : `SectionTitle` avec `C.green`
  - 3 sliders range (1–10) :
    - Energy → couleur `C.green`
    - Focus → couleur `C.cyan`
    - Momentum → couleur `C.amber`
  - Chaque slider : label (`FONT.mono`, `0.68rem`, `C.textDim`, largeur fixe 90px), `<input type="range">` avec `accentColor`, valeur numérique en gras à droite
  - Les sliders sont connectés au store (`energy`, `focus`, `momentum`)

- **Colonne droite — At a Glance (grille 2×2 de Cards cliquables)**
  - Active Projects → `C.green` → navigate vers "projects"
  - Pipeline Items → `C.cyan` → navigate vers "pipeline"
  - Open Ideas (idées non "selected") → `C.amber` → navigate vers "ideas"
  - KPIs Tracked → `C.violet` → navigate vers "kpis"
  - Chaque mini-card : grande valeur numérique (`FONT.mono`, `1.6rem`, bold, couleur), label dessous (`FONT.mono`, `0.6rem`, `C.textDim`, uppercase)

**Grille 2 colonnes :**
- **Roadmap Progress (Card)** — SectionTitle avec `accentColor`
  - Pour chaque phase : label + nom (couleur `phase.accent`), compteur done/total, `ProgressBar`
  
- **Category Allocation (Card)** — SectionTitle avec `accentColor`
  - Pour chaque catégorie : label + nom (couleur `cat.color`), pourcentage, `ProgressBar`

**KPI Snapshot (Card pleine largeur)** — SectionTitle avec `accentColor`
- Grille auto-fill `minmax(180px, 1fr)`
- Pour chaque KPI (max 5) : icône + label, valeur actuelle (colorée selon avancement vs target3m), target 3m, ProgressBar
- Couleur selon progression : ≥100% → `C.green`, ≥60% → `C.amber`, <60% → `C.red`

---

### 8.2 Pipeline

**Objectif** : Kanban board de livrables avec stages et items éditables.

**En-tête :** titre "Pipeline", sous-titre descriptif, bouton "+ Add Stage" (style `btn(C.gold)`)

**Kanban board :**
- `display:flex`, `gap:1rem`, `overflowX:auto`, `alignItems:flex-start`
- Chaque colonne : largeur fixe 270px (`flex: 0 0 270px`), `Card` avec `borderTop: 3px solid stage.color`

**En-tête de colonne (stage) :**
- Nom du stage (`FONT.mono`, `0.72rem`, `bold`, couleur du stage)
- Description (`0.65rem`, `C.textDim`)
- Compteur d'items (`0.62rem`, couleur du stage)
- Boutons : ✎ (éditer stage), × (supprimer stage avec confirmation), "+ Add Item"

**Carte d'item :**
- Titre (`0.78rem`, `C.text`)
- Badge catégorie (couleur de la catégorie)
- Note si non vide (`0.65rem`, `C.textMuted`)
- Date si non vide : `📅 date` (`0.6rem`, `C.textDim`)
- Actions : ✎ éditer, × supprimer (avec confirmation), sélecteur de stage pour déplacer l'item

**Formulaire de stage (StageForm) :**
- Champs : label*, description, color picker
- Boutons : ✓ Save, Cancel

**Formulaire d'item (ItemForm) :**
- Champs : title*, sélecteur stage, sélecteur catégorie, note, date (input type date)
- Boutons : ✓ Save, Cancel

---

### 8.3 Projects

**Objectif** : Liste de projets avec statut, priorité, progression.

**En-tête :** titre "Projects", compteur total, bouton "+ New Project"

**Métadonnées de statut :**
- active → `C.green` "Active"
- pending → `C.amber` "Pending"
- backlog → `#6b7280` "Backlog"
- done → `C.blue` "Done"

**Métadonnées de priorité :**
- high → `C.red` "High"
- medium → `C.amber` "Medium"
- low → `#6b7280` "Low"

**Affichage de projet (Card avec `borderLeft: 3px solid categoryColor`) :**
- Ligne 1 : nom du projet (`0.88rem`, semi-bold), badges statut et priorité, boutons ✎ et ×
- Ligne 2 : badge catégorie + badge phase
- Note si non vide
- ProgressBar avec valeur numérique `progress%`
- Slider `input[type=range]` pour modifier `progress` directement (0-100, `accentColor`)

**Formulaire de projet (ProjectForm) :**
- Champs : name*, sélecteur catégorie, sélecteur phase, sélecteur statut, sélecteur priorité, slider progress (0-100), note
- La Card du formulaire a `borderLeft: 3px solid C.gold`

---

### 8.4 KPIs

**Objectif** : Suivi de métriques sur 3 horizons temporels.

**En-tête :** titre "KPIs", sous-titre descriptif, bouton "+ New Indicator"

**Carte KPI (Card pour chaque KpiDef) :**
- En-tête : icône + label, boutons ✎ et ×
- Valeur actuelle : `input[type=number]` en ligne (modifiable directement), unité, colorée selon progression vs target3m
- 3 ProgressBars superposées :
  - 3m : progression vs target3m (couleur dynamique)
  - 12m : `C.cyan`
  - 36m : `C.violet`
  - Chaque barre affiche son label à gauche et sa valeur cible à droite

**Fonction de couleur :**
- pct ≥ 100 → `C.green`
- pct ≥ 60 → `C.amber`
- pct ≥ 30 → `C.orange`
- pct < 30 → `C.red`

**Formulaire KPI (KpiForm) :**
- Champs : key* (unique, sans espaces), label*, sélecteur icône (parmi 12 emojis prédéfinis), unit, target3m, target12m, target36m
- En mode édition, le champ `key` n'est pas affiché (non modifiable)

---

### 8.5 Roadmap

**Objectif** : Phases séquentielles avec tâches à cocher.

**En-tête :** titre "Roadmap", sous-titre, bouton "+ Add Phase"

**Carte de phase (Card avec `borderTop: 3px solid phase.accent`) :**
- En-tête : `phase.label — phase.name` (couleur `phase.accent`), durée, progression `done/total`, ProgressBar, boutons ✎ et ×
- Liste de tâches (`TaskRow`) :
  - Checkbox colorée `accentColor: phase.accent`
  - Texte : `C.textSoft`, line-through + `C.textDim` si done
  - Actions (visibles au hover) : ✎ éditer inline, × supprimer avec confirmation
  - Double-clic sur texte → édition inline (input)
- Bouton "+ Add Task" en bas de chaque phase

**Comportement hover des tâches :**
- Les boutons d'action sont masqués (`opacity:0`) par défaut et révélés au hover via la classe CSS `.task-row:hover .task-actions { opacity: 1 }` injectée via `<style>` dans le JSX.

**Formulaire de phase (PhaseForm) :**
- Grille 2 colonnes : label, name*, duration, color picker (avec affichage hex)
- Boutons : ✓ Save Phase, Cancel

---

### 8.6 Ideas

**Objectif** : Pipeline d'idées en 3 colonnes (Raw → Sorted → Selected).

**En-tête :** titre "Ideas", compteur total, bouton "+ Add Idea"

**Métadonnées de stage :**
- raw → `C.textDim` "Raw" "Unfiltered captures"
- sorted → `C.amber` "Sorted" "Worth exploring"
- selected → `C.green` "Selected" "Committed to action"

**Affichage :** grille 3 colonnes fixes (1fr chacune)

**Chaque colonne :**
- SectionTitle coloré avec compteur
- Description du stage en `C.textVeryDim`
- Liste de cartes d'idées

**Carte d'idée :**
- Texte de l'idée (`0.78rem`, `C.text`, lineHeight 1.5)
- Source si non vide : `↗ source` (`0.62rem`, `C.textDim`, `FONT.mono`)
- Projet lié si non vide : `→ project` (`0.62rem`, `C.textMuted`, `FONT.mono`)
- Bas de carte : date de création (très atténuée), bouton "→ Sort" ou "→ Select" (si non selected), ✎, ×

**Formulaire d'idée :**
- Champs : text* (textarea), source, projet lié (optionnel), sélecteur stage

---

### 8.7 Planning

**Objectif** : Plan trimestriel en mode lecture / édition.

**En-tête :** titre "Planning", sous-titre "Quarterly execution plan", bouton "✎ Edit" (ou "✓ Save" + "Cancel" en mode édition)

**Card unique avec SectionTitle = `planning.period` :**

7 champs affichés séquentiellement :
| Champ | Label affiché | Type |
|---|---|---|
| `period` | Period | Input monoligne |
| `objective` | Objective | Textarea |
| `arc` | Strategic Arc | Input monoligne |
| `arcEnd` | Arc End Condition | Textarea |
| `focalTool` | Focal Tool | Input monoligne |
| `redZones` | Red Zones | Textarea |
| `singleRule` | Single Rule | Textarea |

- En mode lecture : valeur en `0.82rem`, `C.textSoft`, lineHeight 1.65. Si vide : texte italique `"Not set"` en `C.textVeryDim`.
- En mode édition : inputs/textareas stylisés.
- Labels des champs : `FONT.mono`, `0.62rem`, `C.gold`, uppercase, `letterSpacing:0.12em`

**Comportement :** Le draft est une copie de `planning` modifiée localement. `Save` → `updatePlanning(draft)`. `Cancel` → abandon du draft.

---

### 8.8 Principles

**Objectif** : Définir des modes opérationnels conditionnels.

**En-tête :** titre "Principles", sous-titre descriptif, bouton "+ Add Principle"

**Grille auto-fill `minmax(340px, 1fr)` :**

**Carte de principe (Card avec `borderLeft: 3px solid principle.color`) :**
- En-tête : point coloré + nom (FONT.display), boutons ✎ et ×
- Section Trigger : label "TRIGGER" (couleur du principe), texte du trigger
- Section Rules : label "RULES (n)" (couleur du principe) + éditeur de règles inline (RuleEditor)
- Section Exit : label "EXIT CONDITION" (couleur du principe), texte de condition de sortie

**RuleEditor (sous-composant inline) :**
- Liste numérotée de règles, chaque règle avec bouton ✎ (édition inline) et × (suppression)
- Champ d'ajout en bas avec bouton "Add" (fond plein couleur du principe)
- Ajout via Entrée ou bouton Add

**Formulaire de principe (PrincipleForm) :**
- Champs : name*, color picker, trigger (textarea), exit (textarea)
- Les règles ne font pas partie du formulaire de création — elles sont ajoutées via RuleEditor après création

---

### 8.9 Referentiel

**Objectif** : Répertoire d'entités (stakeholders, équipe, investisseurs…) avec vue maître-détail.

**En-tête :** titre "Referentiel", sous-titre descriptif, bouton "+ Add Entity"

**Layout maître-détail :**
- Grille 2 colonnes : sidebar `260px` + panneau détail `1fr`

**Sidebar — liste des entités :**
- Chaque entrée est une Card cliquable avec `borderLeft: 3px solid entity.color`
- Contenu : point coloré + nom (mis en couleur si sélectionné), rôle en dessous
- L'entrée sélectionnée a un box-shadow `0 0 0 1px entity.color55`

**Panneau détail (EntityReadView) :**
- Sections conditionnelles (affichées seulement si non vides) : Description, Contact, Tags (Badges), Notes
- Notes dans un bloc avec fond `entity.color` à 10% d'opacité et bordure à 25%
- Labels de sections : `FONT.mono`, `0.6rem`, couleur de l'entité, uppercase

**Mode édition :** remplace le panneau détail par EntityForm

**Formulaire d'entité :**
- Grille 2 colonnes : name* + role
- Color picker
- Champs : description (textarea), contact, tags (chaîne séparée par virgules → array au save), notes (textarea)

---

### 8.10 Settings

**Objectif** : Personnalisation globale de l'app et gestion des catégories.

**Bloc App Settings (Card) :**
- 3 champs : App Name (input), Tagline (input), Accent Color (color picker + preview hex + barre de gradient)
- Bouton "Save Changes" avec fond plein `accentColor` et texte `#000`
- Après sauvegarde : texte du bouton change en "✓ Saved!" pendant 1,5 secondes

**Bloc Categories (Card) :**
- En-tête avec SectionTitle + bouton "+ Add"
- Liste des catégories en ligne horizontale :
  - Point coloré + label (couleur) + nom + pourcentage + mini ProgressBar (80px) + ✎ + ×
- Formulaire d'ajout/édition inline (CategoryForm) :
  - Champs : label (court), name*, color picker, pct (0-100)

---

## 9. Charte graphique & design system

### 9.1 Identité visuelle

L'application adopte une esthétique **"dark workspace premium"** : fond très sombre presque noir, texte chaud légèrement ivoire, accentuation or/dorée. L'ensemble évoque un outil de stratégie sérieux, discret et efficace — proche d'un terminal sophistiqué ou d'un cockpit professionnel.

### 9.2 Palette de couleurs complète

```ts
// Fonds (du plus sombre au moins sombre)
bg:           "#0a0c10"  // Fond global de l'application
bgDeep:       "#06080c"  // Fond du TopBar (plus sombre que le bg)
surface:      "#0d1118"  // Fond des Cards
surfaceAlt:   "#141820"  // Fond des inputs et zones imbriquées
surfaceHover: "#1a2030"  // Fond au hover

// Bordures
border:       "#1f2535"  // Bordure standard
borderLight:  "#2d3449"  // Bordure légèrement plus visible

// Or / Accent principal (whitelabel — modifiable par l'utilisateur)
gold:         "#c9a84c"  // Couleur d'accentuation par défaut
goldLight:    "#e0c070"  // Variante claire de l'or
goldDim:      "#8a6e30"  // Variante atténuée de l'or

// Texte (du plus visible au plus discret)
text:         "#e8e4dc"  // Texte principal (légèrement ivoire/chaud)
textSoft:     "#c4c0b5"  // Texte secondaire
textMuted:    "#8a8fa8"  // Texte tertiaire
textDim:      "#555b70"  // Texte très atténué (labels, placeholders)
textVeryDim:  "#3a3f52"  // Texte presque invisible (éléments décoratifs)

// Couleurs sémantiques
green:        "#10b981"  // Succès, actif, validé
greenDark:    "#064e3b"  // Fond vert sombre
red:          "#ef4444"  // Erreur, suppression, danger
redDark:      "#450a0a"  // Fond rouge sombre
amber:        "#f59e0b"  // Avertissement, en cours, trié
orange:       "#f97316"  // Accentuation secondaire (gradient logo)
cyan:         "#06b6d4"  // Focus, information
violet:       "#8b5cf6"  // KPIs, comptage
pink:         "#ec4899"  // R&D, expérimentation
blue:         "#4c7fc9"  // Done (projects), stage In Progress
```

### 9.3 Typographie

| Usage | Police | Taille type | Caractéristiques |
|---|---|---|---|
| `FONT.display` | DM Serif Display, Georgia, serif | 1.0–1.4rem | Titres de vues, noms de principes |
| `FONT.mono` | JetBrains Mono, Courier New, monospace | 0.58–0.78rem | Labels, tags, valeurs numériques, boutons, navigation |
| `FONT.body` | system-ui, Segoe UI, sans-serif | 0.78–0.88rem | Contenu textuel courant |

**Règles typographiques :**
- Les labels de champs et titres de sections sont toujours en `FONT.mono`, uppercase, `letterSpacing` entre 0.08em et 0.12em
- Les valeurs numériques importantes sont en `FONT.mono`, bold, colorées selon contexte
- Le contenu textuel (descriptions, notes, textes d'idées) est en `FONT.body`
- Les titres principaux de vues (`h2`) sont en `FONT.display`, `1.2–1.4rem`

### 9.4 Tailles de texte fréquentes

| Valeur | Usage |
|---|---|
| `0.58rem` | Tags, dates, labels très petits |
| `0.60–0.62rem` | Labels de champs, SectionTitle, compteurs |
| `0.65rem` | Boutons, badges, textes secondaires |
| `0.68–0.72rem` | Sous-titres de vue, valeurs de phase |
| `0.75–0.78rem` | Corps de texte standard (inputs, cartes d'idées) |
| `0.82–0.88rem` | Texte de lecture (planning, entités) |
| `1.0rem` | Icônes KPI, noms de principes |
| `1.1rem` | Valeurs KPI importantes, nom dans TopBar |
| `1.2rem` | Titres de vues (h2) |
| `1.4rem` | Titre Dashboard |
| `1.6rem` | Métriques "at a glance" |

### 9.5 Règles de composants

**Cards :**
- `background: C.surface`
- `border: 1px solid C.border`
- `borderRadius: 10px`
- `padding: 1rem`

**Boutons d'action secondaires (pattern `btn(color)`) :**
- `background: ${color}22` (couleur à ~13% d'opacité)
- `border: 1px solid ${color}44` (~27% d'opacité)
- `color: color`
- `borderRadius: 5px`
- `padding: 0.2–0.3rem 0.6–0.75rem`
- `fontFamily: FONT.mono`
- `fontSize: 0.62–0.65rem`
- `cursor: pointer`

**Boutons d'action primaires (save, add — fond plein) :**
- `background: color` (plein)
- `color: "#000"`
- `border: none`
- `borderRadius: 4–5px`
- `fontFamily: FONT.mono`
- `fontWeight: bold`
- `fontSize: 0.60–0.70rem`

**Inputs :**
- `background: C.surfaceAlt`
- `border: 1px solid C.border`
- `color: C.text`
- `borderRadius: 5px`
- `padding: 0.35rem 0.55rem`
- `fontSize: 0.78rem`
- `outline: none`
- `width: 100%; boxSizing: border-box`

**Bordures d'accentuation latérale (bordure gauche colorée) :**
- `borderLeft: 3px solid color` — utilisé sur les cards de Principles, Referentiel sidebar, Projects
  
**Bordures d'accentuation supérieure :**
- `borderTop: 3px solid color` — utilisé sur les colonnes Pipeline et les cards Roadmap

**Confirmations de suppression :**
- Tous les boutons × déclenchent un état de confirmation intermédiaire (pas de modal)
- Deux boutons apparaissent : "Del" en `C.red` et "×" en `C.textDim`

### 9.6 Espacement

- Gap standard entre éléments d'une liste : `0.5rem`
- Gap entre blocs/cards : `1rem` à `1.25rem`
- Padding interne d'une Card : `1rem`
- Padding du `<main>` : `1.5rem 1.25rem 3rem`
- Padding horizontal du TopBar : `0 2rem` (brand) et `0 1.5rem` (nav)

### 9.7 Effets et animations

- Transitions sur couleurs/bordures : `transition: color 0.15s, border-color 0.15s` (onglets de navigation)
- Hover des tâches : révélation des boutons d'action via `opacity: 0 → 1` (CSS class injectée)
- Pas d'animations complexes, pas de librairie d'animation

### 9.8 Responsive

L'application est **desktop-first** avec `maxWidth: 1440px` centré. Les grilles utilisent `auto-fill` avec `minmax` pour s'adapter partiellement. La navigation utilise `overflowX: auto` pour les petits écrans. Pas de breakpoints media queries explicites.

### 9.9 Logo / icône de marque

- Carré de 26×26px dans le TopBar
- Gradient : `linear-gradient(135deg, accentColor, #f97316)`
- `borderRadius: 6px`
- Pas d'image SVG — forme géométrique pure

---

## 10. Données de seed

Les données suivantes sont chargées à la première ouverture (localStorage vide) :

### AppSettings
```json
{ "name": "STRATEX", "tagline": "Strategic Execution Framework", "accentColor": "#c9a84c" }
```

### Categories (4)
| id | label | name | color | pct |
|---|---|---|---|---|
| cat-core | Core | Core Product | #c9a84c | 70 |
| cat-growth | Growth | Growth & Marketing | #06b6d4 | 15 |
| cat-ops | Ops | Operations & Infra | #8b5cf6 | 10 |
| cat-rd | R&D | Research & Experiments | #ec4899 | 5 |

### Phases Roadmap (4)
| id | label | name | duration | accent | tâches done/total |
|---|---|---|---|---|---|
| ph-discovery | Phase 1 | Discovery | Months 1–3 | #9ca3af | 2/4 |
| ph-build | Phase 2 | MVP Build | Months 4–9 | #f59e0b | 0/4 |
| ph-launch | Phase 3 | Launch | Months 10–15 | #10b981 | 0/4 |
| ph-scale | Phase 4 | Scale | Months 16–24 | #8b5cf6 | 0/3 |

### Pipeline Stages (5 dans l'ordre)
Backlog → Spec → In Progress → Review → Done

### Pipeline Items (7)
Répartis dans les différents stages avec titres, catégories, notes et due dates.

### Projects (5)
Core SaaS Platform, Growth Blog, Internal Tooling, AI Feature Experiments, Affiliate Program.

### KPIs (5)
MRR (€), Daily Active Users, NPS Score, Monthly Churn (%), Paying Customers.  
Toutes les valeurs initiales à `0`.

### Ideas (5)
3 stages représentés : 2 raw, 2 sorted, 1 selected.

### Planning
```json
{
  "period": "Q2 2026",
  "objective": "Launch MVP and reach 50 paying customers",
  "arc": "Phase 2 → Phase 3 transition — from build to launch",
  "arcEnd": "By end of Q2: billing live, onboarding <3 min, first 10 paid users",
  "focalTool": "Stripe — complete payment flow end-to-end this quarter",
  "redZones": "Week of May 20: all-hands offsite. June 28: fiscal year-end.",
  "singleRule": "Ship weekly. No feature without a linked user story."
}
```

### Principles (3)
Focus Mode (`#f59e0b`), Crunch Guard (`#ef4444`), Slow Mode (`#8b5cf6`).

### Entities (4)
Core Team, Seed Investors, Key Accounts, Advisory Board.

### Métriques initiales
`energy: 7, focus: 6, momentum: 5`

---

## 11. Comportements transversaux

### Persistance
- Tout l'état du store est persisté dans `localStorage` avec la clé `"stratex-store"`.
- À chaque modification (action store), localStorage est mis à jour automatiquement par le middleware `persist` de Zustand.
- Les données de seed ne sont utilisées que lors de la première initialisation (store vide).

### Génération d'IDs
- Les IDs sont générés avec le pattern `${prefix}-${Date.now()}` au moment de la création dans le formulaire.
- Préfixes : `cat-`, `ph-`, `t-`, `st-`, `pi-`, `pr-`, `id-`, `pn-`, `en-`

### Suppression — pattern de confirmation
- Tous les éléments supprimables affichent d'abord un bouton × discret.
- Un clic passe en mode "confirmation" : deux boutons "Del" (rouge) et "×" (annuler) remplacent le bouton initial.
- Pas de modal, tout est inline dans la carte.

### Formulaires inline
- Les formulaires d'ajout/édition apparaissent directement dans la vue (pas de modale ni de drawer).
- Le formulaire d'ajout se place en haut de la liste.
- Le formulaire d'édition remplace l'affichage de l'élément concerné.
- La touche Escape annule l'édition inline sur les champs de tâches.
- La touche Enter valide l'édition inline sur les champs de tâches.

### État local des vues
- Chaque vue gère son propre état UI local (`useState`) pour les modes ajout/édition/confirmation.
- Cet état UI local n'est jamais persisté.

### Whitelabel
- `settings.name`, `settings.tagline` et `settings.accentColor` sont lus depuis le store dans TopBar et DashboardView.
- L'`accentColor` est utilisée comme couleur d'accentuation dynamique dans le TopBar (logo gradient, onglet actif, titre).
- Toutes les modifications de settings sont appliquées immédiatement après "Save Changes".
