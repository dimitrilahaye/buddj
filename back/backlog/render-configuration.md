# Configuration du projet pour Render

## Render

[Render](https://render.com/) est un service qui permet de builder et déployer des projets web.

Le plan [Hobby](https://render.com/pricing#compute) donne aussi accès à une BDD Postgres.

## TODO

- [ ] Ajouter une route health-check dans l'API
- [ ] Configurer le front dans Render
- [ ] Ajouter les variables d'env. dans le front
- [ ] Tester le front sur le navigateur
- [ ] Configurer le back dans Render
- [ ] Ajouter les variables d'env. dans le back
- [ ] Tester le back sur le navigateur (route health-check)
- [ ] Mettre en place la CD
- [ ] Acheter le DNS buddj.app
- [ ] Configurer le subdomain api.buddj.app
- [ ] Mettre à jour le token côté Google
- [ ] Déployer
- [ ] Tester la PWA

> La stratégie sera de faire vivre mortalkompta.app et buddj.app en parallèle. Les deux se basant sur la même BDD.
> Lorsque le front v2 de buddj.app sera finalisé, on switchera sur la BDD de Render puis on débranchera MortalKompta.
