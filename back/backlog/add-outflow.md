# Ajouter une sortie mensuelle

## Route
**[POST]** `/months/:monthId/outflows`

**Body:**

```json
{
  "label": "TAN",
  "amount": 20
}
```

Il faudra un `OutflowFactory`
