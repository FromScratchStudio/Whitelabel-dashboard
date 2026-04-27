import { C, FONT } from "../../theme";
import { useStore } from "../../store/useStore";
import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

// ─── Lightweight markdown-like renderers ─────────────────────────────────────

type RowPair = [string, string];

function Table({ headers, rows }: { headers: string[]; rows: RowPair[] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.mono, fontSize: "0.68rem" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "0.4rem 0.75rem",
                  background: C.surfaceAlt,
                  color: C.textDim,
                  borderBottom: `1px solid ${C.border}`,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([col1, col2], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.surfaceAlt }}>
              <td style={{ padding: "0.4rem 0.75rem", color: C.gold, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}` }}>
                <strong>{col1}</strong>
              </td>
              <td style={{ padding: "0.4rem 0.75rem", color: C.textSoft, borderBottom: `1px solid ${C.border}` }}>{col2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: C.bgDeep,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "0.75rem 1rem",
        fontFamily: FONT.mono,
        fontSize: "0.65rem",
        color: C.textSoft,
        overflowX: "auto",
        marginBottom: "1rem",
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  const accentColor = useStore((s) => s.settings.accentColor);
  return (
    <h2
      style={{
        fontFamily: FONT.display,
        fontSize: "1rem",
        color: accentColor,
        marginBottom: "0.75rem",
        marginTop: "0.25rem",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: FONT.mono,
        fontSize: "0.72rem",
        color: C.textSoft,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "0.6rem",
        marginTop: "0.25rem",
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: C.textSoft, lineHeight: 1.7, marginBottom: "0.75rem" }}>
      {children}
    </p>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ paddingLeft: "1.25rem", marginBottom: "0.75rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.textSoft, lineHeight: 1.7, marginBottom: "0.2rem" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── View ─────────────────────────────────────────────────────────────────────

export default function UserGuideView() {
  const accentColor = useStore((s) => s.settings.accentColor);
  const name = useStore((s) => s.settings.name);

  return (
    <div>
      <h1 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.text, marginBottom: "0.35rem" }}>
        📖 User Guide
      </h1>
      <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginBottom: "1.5rem", letterSpacing: "0.06em" }}>
        {name} — Manuel utilisateur
      </p>

      {/* Description */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Description</SectionTitle>
        <P>
          <strong style={{ color: C.gold }}>{name}</strong> est une application de pilotage stratégique pour startups et équipes projet.
          Elle est entièrement <em>whitelabel</em> : nom, tagline et couleur d'accentuation sont personnalisables depuis les réglages et se propagent à toute l'interface.
        </P>
        <P>
          Toutes les données sont persistées dans le <code style={{ fontFamily: FONT.mono, fontSize: "0.75em", background: C.surfaceAlt, padding: "0.1em 0.35em", borderRadius: 3, color: C.cyan }}>localStorage</code> du navigateur — aucun backend, aucune base de données distante.
        </P>
      </Card>

      {/* Vues */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Vues disponibles</SectionTitle>
        <Table
          headers={["Vue", "Description"]}
          rows={[
            ["Dashboard", "Vue synthétique : résumé des KPIs, tâches actives, avancement global."],
            ["Pipeline", "Kanban de livrables par étape (colonnes personnalisables)."],
            ["Projects", "Liste des projets avec statut, priorité et progression."],
            ["KPIs", "Objectifs sur 3 horizons (3 mois, 12 mois, 36 mois) avec suivi de valeur actuelle."],
            ["Roadmap", "Phases et tâches avec avancement par phase."],
            ["Ideas", "Pipeline d'idées Raw → Sorted → Selected."],
            ["Planning", "Plan trimestriel en texte libre."],
            ["Principles", "Principes opérationnels conditionnels (Si… Alors…)."],
            ["Referentiel", "Répertoire des entités clés (équipe, investisseurs, clients, conseillers)."],
            ["Settings", "Personnalisation du nom, tagline et couleur d'accentuation."],
          ]}
        />
      </Card>

      {/* Personnalisation */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Personnalisation (Whitelabel)</SectionTitle>
        <P>Depuis la vue <strong style={{ color: C.gold }}>Settings</strong>, vous pouvez modifier :</P>
        <Ul
          items={[
            <><strong style={{ color: C.textSoft }}>Nom de l'application</strong> — propagé dans toute l'interface.</>,
            <><strong style={{ color: C.textSoft }}>Tagline</strong> — sous-titre affiché dans la barre de navigation.</>,
            <><strong style={{ color: C.textSoft }}>Couleur d'accentuation</strong> — thème visuel global (onglet actif, titres, boutons).</>,
          ]}
        />
        <P>Ces paramètres sont persistés dans le <code style={{ fontFamily: FONT.mono, fontSize: "0.75em", background: C.surfaceAlt, padding: "0.1em 0.35em", borderRadius: 3, color: C.cyan }}>localStorage</code> et s'appliquent instantanément.</P>
      </Card>

      {/* Stack technique */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Stack technique</SectionTitle>
        <Table
          headers={["Élément", "Choix"]}
          rows={[
            ["Framework UI", "React 18"],
            ["Langage", "TypeScript 5"],
            ["Bundler", "Vite 5"],
            ["State management", "Zustand 5 (middleware persist → localStorage)"],
            ["Styles", "CSS-in-JS inline (React.CSSProperties)"],
            ["Fonts", "Google Fonts : DM Serif Display, JetBrains Mono"],
            ["Routing", "Aucun — navigation par état Zustand (activeView)"],
            ["Déploiement", "GitHub Pages via GitHub Actions"],
          ]}
        />
      </Card>

      {/* Architecture */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Architecture</SectionTitle>
        <CodeBlock>{`src/
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
    └── views/            # Une vue par section`}</CodeBlock>
        <H3>Règles clés</H3>
        <Ul
          items={[
            "Les composants de vue ne reçoivent pas de props — ils lisent directement le store.",
            "Toutes les mutations passent par les actions du store.",
            "Les IDs sont générés avec Date.now().",
          ]}
        />
      </Card>

      {/* Démarrage rapide */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle accent={accentColor}>Démarrage rapide</SectionTitle>
        <H3>Prérequis</H3>
        <Ul items={["Node.js ≥ 20", "npm ≥ 10"]} />
        <H3>Installation</H3>
        <CodeBlock>{`git clone https://github.com/FromScratchStudio/Whitelabel-dashboard.git
cd Whitelabel-dashboard
npm install`}</CodeBlock>
        <H3>Développement</H3>
        <CodeBlock>{`npm run dev`}</CodeBlock>
        <P>L'application sera accessible sur <code style={{ fontFamily: FONT.mono, fontSize: "0.75em", background: C.surfaceAlt, padding: "0.1em 0.35em", borderRadius: 3, color: C.cyan }}>http://localhost:5174</code>.</P>
        <H3>Build de production</H3>
        <CodeBlock>{`npm run build`}</CodeBlock>
        <P>Le bundle de production est généré dans le dossier <code style={{ fontFamily: FONT.mono, fontSize: "0.75em", background: C.surfaceAlt, padding: "0.1em 0.35em", borderRadius: 3, color: C.cyan }}>dist/</code>.</P>
        <H3>Vérification des types</H3>
        <CodeBlock>{`npm run typecheck`}</CodeBlock>
      </Card>

      {/* Déploiement */}
      <Card>
        <SectionTitle accent={accentColor}>Déploiement</SectionTitle>
        <P>Le déploiement est automatisé via GitHub Actions (<code style={{ fontFamily: FONT.mono, fontSize: "0.75em", background: C.surfaceAlt, padding: "0.1em 0.35em", borderRadius: 3, color: C.cyan }}>.github/workflows/deploy.yml</code>).</P>
        <Ul
          items={[
            <><strong style={{ color: C.textSoft }}>Déclencheur</strong> : chaque push sur la branche <code style={{ fontFamily: FONT.mono, fontSize: "0.85em", color: C.cyan }}>main</code>.</>,
            <><strong style={{ color: C.textSoft }}>Étapes</strong> : vérification des types → build → publication sur GitHub Pages.</>,
          ]}
        />
        <H2>🌐 Démo en ligne</H2>
        <P>
          <a
            href="https://fromscratchstudio.github.io/Whitelabel-dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accentColor, fontFamily: FONT.mono, fontSize: "0.75rem" }}
          >
            https://fromscratchstudio.github.io/Whitelabel-dashboard/
          </a>
        </P>
      </Card>
    </div>
  );
}
