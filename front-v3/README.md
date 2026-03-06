# Buddj — Front PWA

Application de gestion de budget : charges récurrentes et enveloppes budgétaires. PWA en TypeScript avec Web Components (sans framework).

## Prérequis

- **Node.js** 18+ (recommandé : 20 LTS)
- **npm** ou **pnpm**

## Démarrage

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement (port 3847)
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

L’app est disponible sur **http://localhost:3847** en dev.

## Structure du projet

```bash
front-3/
├── index.html              # Point d’entrée HTML
├── styles.css              # Styles globaux (variables, layout, composants)
├── src/
│   ├── main.ts             # Bootstrap : imports des composants + routeur
│   ├── router.ts           # Routeur SPA (outflows/:monthId, budgets/:monthId)
│   └── components/         # Web Components (organisation component-driven)
│       ├── icons/          # Atomes : icônes (edit, delete, transfer, save, toggle)
│       ├── atoms/          # text-ellipsis, amount, btn-add
│       ├── molecules/      # charge-item, expense-item, budget-totals…
│       ├── organisms/      # nav, summary-bar, section-header, charge-group, budget-card…
│       └── screens/        # screen-recurring, screen-budgets
├── .cursor/
│   └── rules/
│       └── buddj-architecture.mdc   # Architecture détaillée et conventions
└── TODO.md                 # Tâches en cours / à faire
```

## Architecture

- **Présentation** : Web Components (Custom Elements v1). Aucune logique métier ni appel API direct.
- **Métier** (à venir) : domaine, use-cases, store.
- **Datasource** (à venir) : client API.

Les règles complètes (hexagonale, component-driven, style UI, conventions de code) sont dans **`.cursor/rules/buddj-architecture.mdc`**.

## Stack

| Outil        | Rôle                          |
|-------------|--------------------------------|
| TypeScript  | Langage unique (pas de React/Vue) |
| Vite        | Build et dev server           |
| Web Components | UI (Custom Elements v1)    |
| Vite PWA    | Service Worker, cache, offline |

## Données actuelles

L’interface utilise des **données en dur** dans les composants d’écran (`buddj-screen-recurring.ts`, `buddj-screen-budgets.ts`). L’intégration au store et à l’API est à faire (voir TODO.md et l’architecture).
