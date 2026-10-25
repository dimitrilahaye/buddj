# TODO

## Suivi précis

Persister dans une table à part toutes les dépenses et les sorties ajoutées après la création du mois — avec la date.
On supprime dans cette table si on la supprime dans une autre.
Donc on persiste le type "expense" ou "outcome" + l'id associé.
Avoir une route permettant d'afficher les dépenses globales à la journée, à la semaine, au mois...

## Système de backup:

- https://soshace.com/automated-postgresql-backups-with-nodejs-and-bash/
- Passer par App Scripts tous les jours
- Envoie d'un mail avec le zip dedans
