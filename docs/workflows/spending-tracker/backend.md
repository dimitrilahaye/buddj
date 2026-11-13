# Suivi des dépenses : workflows backend

Le suivi des dépenses (`spending-tracker`) tient un journal horodaté des dépenses hebdo (`expense`) et des sorties (`outflow`) ajoutées après la création d'un mois. Le journal est alimenté par des événements de domaine typés, traités hors du chemin de la requête. Il survit à la suppression des mois, car la table `tracked_spendings` n'a aucune clé étrangère.

Briques en jeu :

| Brique | Fichier |
|---|---|
| Carte des événements | `back/src/core/events/DomainEventMap.ts` |
| Ports | `back/src/core/ports/providers/EventPublisher.ts`, `EventSubscriber.ts`, `back/src/core/ports/repositories/TrackedSpendingRepository.ts` |
| Bus (adapter) | `back/src/providers/events/NodeEventBus.ts` |
| Abonnements | `back/src/ioc/subscriptions.ts` |
| Use-cases | `back/src/core/usecases/spending-tracker/{TrackSpending,UntrackSpending,GetSpendingTracker}.ts` |
| Persistance | `back/src/providers/persistence/repositories/TrackedSpendingRepository.ts`, table `tracked_spendings` |
| Route | `back/src/consumers/api/routes/spending-tracker/getSpendingTracker.ts` |

Règles communes :

- **Publication après persistance :** un use-case ne publie qu'après la persistance réussie de l'opération principale. S'il échoue avant, par exemple sur un `MonthNotFoundError`, rien n'est publié.
- **Handlers hors requête :** `publish` rend la main immédiatement. Chaque handler est planifié via `setImmediate`, donc la réponse HTTP n'attend jamais le journal.
- **Erreurs isolées :** l'erreur d'un handler est loggée (`[events] handler for "<event>" failed`) et n'est jamais remontée à l'utilisateur.
- **Idempotence :** l'unicité de `(kind, source_id)` fait qu'un rejeu de `expenseAdded` ou `outflowAdded` est ignoré (`ON CONFLICT DO NOTHING`).

Choix assumés :

- **Suppression d'un budget hebdo :** `RemoveBudget` efface les dépenses du budget en cascade sans rien publier. Elles restent donc dans le journal, comme pour un mois supprimé. C'est voulu : supprimer un budget à 0 € dont toutes les dépenses sont cochées sert à désencombrer l'écran des budgets, pas à effacer des dépenses réelles. Seul un `DELETE` explicite de dépense ou de sortie retire une ligne du journal.
- **Modification d'une dépense :** la route dépréciée `UpdateExpense` n'est pas utilisée par le front. Elle ne publie aucun événement, et le journal garde les valeurs de l'ajout.
- **Échec d'écriture dans le journal :** la ligne est perdue et il n'y a pas de rattrapage. L'opération de l'utilisateur, elle, est conservée.

## Ajout d'une dépense hebdo

`POST /months/:monthId/weeks/:weekId/expenses`

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant Route as routes/month/addWeeklyExpense
    participant UC as AddWeeklyExpense
    participant MonthRepo as MonthRepository
    participant Bus as NodeEventBus
    participant Sub as ioc/subscriptions
    participant Track as TrackSpending
    participant Repo as TrackedSpendingRepository
    participant DB as Postgres

    Front->>Route: POST { label, amount }
    Route->>UC: execute(AddWeeklyExpenseCommand)
    UC->>UC: WeeklyExpenseFactory.create (date = now)
    UC->>MonthRepo: getById, updateWeeklyBudgetCurrentBalance, addExpenseToWeeklyBudget
    MonthRepo->>DB: weekly_budgets, weekly_expenses
    UC->>Bus: publish("expenseAdded", { expenseId, label, amount, occurredAt: expense.date })
    Bus-->>UC: retour immédiat
    UC-->>Route: Month
    Route-->>Front: 201 { success, data: monthDto }

    Note over Bus,DB: Après la réponse (setImmediate)
    Bus->>Sub: handler expenseAdded
    Sub->>Track: execute({ kind: "expense", sourceId: expenseId, label, amount, occurredAt })
    Track->>Repo: save(TrackedSpending)
    Repo->>DB: INSERT tracked_spendings ON CONFLICT DO NOTHING
```

## Ajout d'une sortie

`POST /months/:monthId/outflows`

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant Route as routes/month/addOutflow
    participant UC as AddOutflow
    participant MonthRepo as MonthRepository
    participant Bus as NodeEventBus
    participant Sub as ioc/subscriptions
    participant Track as TrackSpending
    participant Repo as TrackedSpendingRepository
    participant DB as Postgres

    Front->>Route: POST { label, amount }
    Route->>UC: execute(AddOutflowCommand)
    UC->>UC: AccountOutflowFactory.create
    UC->>MonthRepo: getById, addOutflow
    MonthRepo->>DB: outflows
    UC->>Bus: publish("outflowAdded", { outflowId, label, amount, occurredAt: now })
    Bus-->>UC: retour immédiat
    UC-->>Route: Month
    Route-->>Front: 201 { success, data: monthDto }

    Note over Bus,DB: Après la réponse (setImmediate)
    Bus->>Sub: handler outflowAdded
    Sub->>Track: execute({ kind: "outflow", sourceId: outflowId, label, amount, occurredAt })
    Track->>Repo: save(TrackedSpending)
    Repo->>DB: INSERT tracked_spendings ON CONFLICT DO NOTHING
```

La table `outflows` n'a pas de date de création. L'horodatage du journal est donc pris dans le use-case, au moment de l'ajout.

## Suppression d'une dépense hebdo

`DELETE /months/:monthId/weekly/:weeklyId/expenses/:expenseId`

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant Route as routes/month/deleteExpense
    participant UC as DeleteExpense
    participant MonthRepo as MonthRepository
    participant Bus as NodeEventBus
    participant Sub as ioc/subscriptions
    participant Untrack as UntrackSpending
    participant Repo as TrackedSpendingRepository
    participant DB as Postgres

    Front->>Route: DELETE
    Route->>UC: execute(DeleteExpenseCommand)
    UC->>MonthRepo: getById, deleteExpense, updateWeeklyBudgetCurrentBalance
    MonthRepo->>DB: DELETE weekly_expenses, UPDATE weekly_budgets
    UC->>Bus: publish("expenseDeleted", { expenseId })
    Bus-->>UC: retour immédiat
    UC-->>Route: Month
    Route-->>Front: 200 { success, data: monthDto }

    Note over Bus,DB: Après la réponse (setImmediate)
    Bus->>Sub: handler expenseDeleted
    Sub->>Untrack: execute({ kind: "expense", sourceId: expenseId })
    Untrack->>Repo: deleteBySource("expense", expenseId)
    Repo->>DB: DELETE tracked_spendings WHERE kind and source_id
```

Si la dépense avait été créée avec le mois, elle n'a pas de ligne dans le journal. La suppression ne touche alors aucune ligne et ne lève pas d'erreur.

## Suppression d'une sortie

`DELETE /months/:monthId/outflows/:outflowId`

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant Route as routes/month/deleteOutflow
    participant UC as DeleteOutflow
    participant MonthRepo as MonthRepository
    participant Bus as NodeEventBus
    participant Sub as ioc/subscriptions
    participant Untrack as UntrackSpending
    participant Repo as TrackedSpendingRepository
    participant DB as Postgres

    Front->>Route: DELETE
    Route->>UC: execute(DeleteOutflowCommand)
    UC->>MonthRepo: getById, deleteOutflow
    MonthRepo->>DB: DELETE outflows
    UC->>Bus: publish("outflowDeleted", { outflowId })
    Bus-->>UC: retour immédiat
    UC-->>Route: Month
    Route-->>Front: 200 { success, data: monthDto }

    Note over Bus,DB: Après la réponse (setImmediate)
    Bus->>Sub: handler outflowDeleted
    Sub->>Untrack: execute({ kind: "outflow", sourceId: outflowId })
    Untrack->>Repo: deleteBySource("outflow", outflowId)
    Repo->>DB: DELETE tracked_spendings WHERE kind and source_id
```

## Échec d'un handler

Exemple : la base est indisponible au moment d'écrire dans le journal.

```mermaid
sequenceDiagram
    autonumber
    participant UC as Use-case (AddOutflow...)
    participant Bus as NodeEventBus
    participant Track as TrackSpending
    participant Repo as TrackedSpendingRepository
    participant Log as console.error

    UC->>Bus: publish("outflowAdded", payload)
    Bus-->>UC: retour immédiat (la réponse HTTP part normalement)
    Note over Bus,Log: Après la réponse (setImmediate)
    Bus->>Track: execute(command)
    Track->>Repo: save
    Repo--xTrack: Error
    Track--xBus: rejet
    Bus->>Log: [events] handler for "outflowAdded" failed
```

L'opération de l'utilisateur est conservée. Seule la ligne du journal manque, et elle n'est pas rejouée automatiquement.

## Suppression d'un mois

`DELETE /months/:monthId` : aucun événement n'est publié.

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant UC as DeleteMonth
    participant MonthRepo as MonthRepository
    participant DB as Postgres

    Front->>UC: DELETE /months/:monthId
    UC->>MonthRepo: delete(month)
    MonthRepo->>DB: DELETE months, accounts (cascade outflows, weekly_budgets, weekly_expenses)
    Note over DB: tracked_spendings n'a aucune FK : les lignes du mois restent dans le journal
    UC-->>Front: 200
```

## Lecture du suivi

`GET /spending-tracker?granularity=day|week|month&from=YYYY-MM-DD&to=YYYY-MM-DD`

```mermaid
sequenceDiagram
    autonumber
    actor Front
    participant Route as routes/spending-tracker/getSpendingTracker
    participant Deser as deserializers/spending-tracker/getSpendingTracker
    participant UC as GetSpendingTracker
    participant Cal as ParisCalendar
    participant Repo as TrackedSpendingRepository
    participant DB as Postgres
    participant Model as SpendingTracker
    participant Dto as spendingTrackerDto

    Front->>Route: GET ?granularity=week&from=2026-08-01&to=2026-11-13
    Route->>Deser: deserializer(req.query)
    alt query invalide (granularité inconnue, date mal formée ou impossible, from > to)
        Deser--xRoute: RequestValidationError
        Route-->>Front: 400 { success: false, message }
    end
    Deser-->>Route: GetSpendingTrackerCommand
    Route->>UC: execute(command)
    UC->>Cal: parisMidnight(from), parisMidnight(to + 1 jour)
    UC->>Repo: findBetween(début, fin)
    Repo->>DB: SELECT ... WHERE occurred_at >= début AND occurred_at < fin ORDER BY occurred_at
    DB-->>Repo: lignes
    Repo-->>UC: TrackedSpending[]
    UC->>Model: new SpendingTracker({ granularity, from, to, entries })
    Note over Model: Buckets jour, semaine (lundi) ou mois en heure de Paris<br/>buckets vides inclus, entrées triées par montant décroissant<br/>totaux global, expenses et outflows arrondis au centime
    UC-->>Route: SpendingTracker
    Route->>Dto: spendingTrackerDto(tracker)
    Route-->>Front: 200 { success, data }
```

Forme de `data` :

```json
{
  "granularity": "week",
  "from": "2026-08-01",
  "to": "2026-11-13",
  "total": 1234.56,
  "expensesTotal": 534.56,
  "outflowsTotal": 700,
  "buckets": [
    {
      "start": "2026-07-27",
      "total": 42.1,
      "expensesTotal": 42.1,
      "outflowsTotal": 0,
      "entries": [
        {
          "id": "…",
          "kind": "expense",
          "sourceId": "…",
          "label": "Courses",
          "amount": 42.1,
          "occurredAt": "2026-08-01T08:30:00.000Z"
        }
      ]
    }
  ]
}
```

Le premier bucket commence au début de sa période (lundi ou 1er du mois), qui peut précéder `from`. Les entrées et les totaux, eux, restent bornés à `[from, to]`.
