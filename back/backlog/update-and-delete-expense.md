# Mettre à jour et supprimer une dépense

## Règles communes

- Quand on delete une dépense:
- Quand on modifie le montant ou la semaine d'une dépense:
  - on recalcule le montant de la weekly outflow correspondant

**De façon générale:**
Quand on recalcule le montant d'une weekly outflow, si le montant est supérieur à 0, on uncheck systématiquement.

## Mettre à jour

### Route

[PUT] /month/:monthId/expenses/:expenseId
**Body:**
```json
{
  "weekId": "e905c39c-5f53-463e-82a6-b7af63aadea5",
  "label": "JOW",
  "amount": 10
}
```

## Suppression

### Route

[DELETE] /month/:monthId/expenses/:expenseId
