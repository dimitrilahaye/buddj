# Cocher et décocher une dépense

## Cas des expenses modifiées

PUT months/${monthId}/weeks/${weekId}/expenses-checking
body: {
    checked: [ids],
    unchecked: [ids],
}

Quand on check un expense existant:
Quand on uncheck un expense existant:
- on met à jour le Month->Account->outflow correspondant avec le bon currentBalanceForOutflow
    - basé sur le nom de la semaine -> weekly.name === outflow.label
