import { fireEvent, waitFor } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createSavingsAccountServiceFromInMemory } from '../../src/adapters/savings-account-service-from-in-memory.js';
import type { SavingsAccountView } from '../../src/application/savings-account/savings-account-types.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { monthServiceEmpty } from '../helpers/month-service-empty.js';

export const LIVRET_A: Omit<SavingsAccountView, 'amount'> = {
  id: 'livret-a',
  name: 'Livret A Crédit Agricole',
  operations: [
    { id: 'retrait-novembre', type: 'withdrawal', amount: 300, label: 'Trou de trésorerie', date: '2026-11-10' },
    { id: 'virement-novembre', type: 'deposit', amount: 150, label: null, date: '2026-11-02' },
    { id: 'solde-initial', type: 'deposit', amount: 5000, label: 'Solde initial', date: '2026-10-01' },
  ],
};

export const LDDS: Omit<SavingsAccountView, 'amount'> = {
  id: 'ldds',
  name: 'LDDS',
  operations: [{ id: 'ldds-initial', type: 'deposit', amount: 1200, label: null, date: '2026-09-01' }],
};

export function startOn({
  path,
  service = createSavingsAccountServiceFromInMemory({ accounts: [LIVRET_A, LDDS] }),
}: {
  path: string;
  service?: ReturnType<typeof createSavingsAccountServiceFromInMemory>;
}) {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-burger-panel id="burger-panel"></buddj-burger-panel>
    <header class="global-header"><buddj-nav></buddj-nav></header>
    <main id="screen-outlet" role="main"></main>
  `;
  window.history.replaceState(null, '', path);
  bootstrap({
    authService: createAuthServiceFromInMemory(true),
    monthService: monthServiceEmpty,
    savingsAccountService: service,
  });
  return service;
}

/** Saisit un montant via la calculatrice globale, ex. ['4', '2'] pour 42 €. */
export async function typeAmount(digits: string[]): Promise<void> {
  const calc = document.getElementById('calculator-drawer')!;
  await waitFor(() => {
    if (!calc.classList.contains('calculator-drawer--open')) throw new Error('calculatrice fermée');
  });
  fireEvent.click(calc.querySelector('[data-action="clear"]')!);
  for (const digit of digits) fireEvent.click(calc.querySelector(`[data-digit="${digit}"]`)!);
  const validate = Array.from(calc.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Valider');
  fireEvent.click(validate!);
}
