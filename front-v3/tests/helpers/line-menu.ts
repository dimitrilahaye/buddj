import { fireEvent } from '@testing-library/dom';

/** Ouvre le menu ⋮ d’une ligne (dépense, charge, budget de template/annuel) et clique sur l’action. */
export function clickLineMenuAction(row: Element, action: 'edit' | 'delete'): void {
  const trigger = row.querySelector('buddj-actions-dropdown .btn-menu-dots');
  if (!trigger) throw new Error('Menu ⋮ introuvable sur la ligne');
  fireEvent.click(trigger);
  const item = row.querySelector(`buddj-actions-dropdown [data-action="${action}"]`);
  if (!item) throw new Error(`Action « ${action} » introuvable dans le menu`);
  fireEvent.click(item);
}

/**
 * Remplit un drawer d’ajout/édition (dépense, charge, budget) : libellé puis montant via la calculatrice.
 * `prefix` : `expense` | `charge` | `budget` (sélecteurs `data-<prefix>-add-*`).
 */
export async function fillLineDrawer({
  drawer,
  prefix,
  label,
  amountDigits,
  waitFor,
}: {
  drawer: HTMLElement;
  prefix: 'expense' | 'charge' | 'budget';
  label: string;
  /** Touches de la calculatrice, ex. ['1', '8', ',', '5']. */
  amountDigits: string[];
  waitFor: (cb: () => void) => Promise<unknown>;
}): Promise<void> {
  const labelInput = drawer.querySelector(`[data-${prefix}-add-label]`) as HTMLInputElement;
  fireEvent.input(labelInput, { target: { value: label } });
  fireEvent.click(drawer.querySelector(`[data-${prefix}-add-amount]`)!);
  const calc = document.getElementById('calculator-drawer')!;
  await waitFor(() => {
    if (!calc.classList.contains('calculator-drawer--open')) throw new Error('calculatrice fermée');
  });
  fireEvent.click(calc.querySelector('[data-action="clear"]')!);
  for (const digit of amountDigits) {
    fireEvent.click(calc.querySelector(`[data-digit="${digit}"]`)!);
  }
  const validateCalc = Array.from(calc.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Valider');
  fireEvent.click(validateCalc!);
  fireEvent.click(drawer.querySelector(`.${prefix}-add-drawer-validate`)!);
}
