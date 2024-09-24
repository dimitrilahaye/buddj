# Gérer le checking des sorties mensuelles

- checked/unchecked
- update current balance

## Route
[PUT] `/months/:monthId/outflows/checking`
**Body**

```json
{
  "currentBalance": 2000.50,
  "outflows": [
    {
      "id": "bb4c9565-7cee-4dd8-9a7f-4d2f56d33b9a",
      "isChecked": true
    }
  ]
}
```


