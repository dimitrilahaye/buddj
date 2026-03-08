# Règles Cursor — front-v3

Point d’entrée vers les règles du projet. Chaque fichier `.mdc` est une règle Cursor (avec frontmatter `description`, `globs`).

| Fichier | Description |
|---------|-------------|
| [buddj-architecture.mdc](./buddj-architecture.mdc) | Architecture hexagonale, structure de dossiers, flux de données, organisation component-driven, rappels |
| [stack.mdc](./stack.mdc) | Stack technique : TypeScript, Web Components, Vite, PWA |
| [style-ui.mdc](./style-ui.mdc) | Style UI : thème sombre, typo, composants, couleurs, accessibilité |
| [named-arguments-convention.mdc](./named-arguments-convention.mdc) | Conventions de code : arguments nommés (objet unique) pour méthodes, fonctions et constructeurs |
| [dry-shared-types-and-utils.mdc](./dry-shared-types-and-utils.mdc) | DRY : mutualisation des types (à partir de 3 doublons) et des fonctions (à partir de 2 doublons) dans `shared/` |
| [store-events-and-injection.mdc](./store-events-and-injection.mdc) | Store EventTarget, events par slice (actions = verbe, état = entité + participe passé), injection explicite, `emitAction`, flux réactivité et testabilité |
