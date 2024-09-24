# TODO

## Destination monorepo

- [x] CI avec DB embarquée
- [x] Création d'un monorepo sur le compte github de
      dimitrilahaye
- [x] Revoir la DX du repo pour le faire tourner en local
- [x] Installer Renovate
- [x] Lancer la CI sur le monorepo
- [x] Pouvoir déployer le back sur Vercel
- [ ] Brancher [Render](https://render.com/)
- [ ] Brancher les DNS
- [ ] Lancer la CD

## Grandes étapes suivantes

- Refonte du front
- Remplacer Vercel
- Passer en monorepo
- Mettre en place une nouvelle CI/DI

## Nouvelles fonctionnalités

- système de backup:
  - https://soshace.com/automated-postgresql-backups-with-nodejs-and-bash/
  - Passer par App Scripts tous les jours
  - Envoie d'un mail avec le zip dedans
- Transférer un peu d'un budget hebdo vers le compte courant (en cas de découvert prévu)
- Prévisualisation du prévisionnel
  - faire la création d'un mois en 3 étapes
    - 1. solde courant
    - 2. sorties mensuelles
    - 3. budgets hebdo
  - et à chaque fois on a un rappel du solde prévisionnel
- archiveMonth -> retourne tous les unarchived !
- Mettre le reste d'une semaine sur une autre
  - Aussi impacter le négatif d'une semaine sur une autre
- Mettre tout ou partie du account forescast sur une semaine
- à la création d'un mois:
  - proposer d'archiver le mois en cours
  - proposer de dispatcher le forecast sur les weekly budgets
  - proposer de transférer les expenses en cours dans la première semaine
    - et donc leur suppression du mois en cours
- Gestion des templates : outflows / budgets hebdo
  - création
  - modification
  - suppression
  - utilisation pour la création d'un mois
  - template par défaut
- Calendriers de frais annuels / chaque sortie ajoutée automatiquement dans les feuilles correspondantes
- update expense
- update outflow
- update weekly budget
- Persister le checkedAt pour Expense et Outflow
- App script pour faire tourner les tokens chaque heure - call api une clé-api
  - Gérer les propriétés Google App Script
- Ajouter plusieurs expenses avant de soumettre
- Cocher les sorties et les CB au même endroit

## Refacto à prévoir

- fix les stub dans les routes
- remplacer le new Month par un `tests/utils/models/monthBuilder` dans `src/tests/integration/consumers/manageExpensesChecking.test.ts`
- injecter les dto dans les routes
- virer la couche Account ?
- avoir une classe par DTO ?
- mettre une vraie interface dans les factory
- Passer tous mes tests de consummers en unitaire
- Et donc injecter mes command
- Utiliser les termes Serializer et Deserializer ? En fonctions du coup
- En profiter pour avoir qu'une erreur globale "route params and body malformed" avec le nom de la route en paramètre
