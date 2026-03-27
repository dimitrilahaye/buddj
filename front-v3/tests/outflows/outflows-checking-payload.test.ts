import { describe, it, expect } from 'vitest';
import { buildOutflowsCheckingPayload, applyOutflowToggleToMonthView } from '../../src/application/month/outflows-checking-payload.js';
import type { MonthView } from '../../src/application/month/month-view.js';

describe('payload checking outflows', () => {
  it('envoie toutes les charges, avec celle cochée mise à jour', () => {
    const month: MonthView = {
      id: 'm1',
      accountId: 'a1',
      isoDate: '2026-03-01T00:00:00.000Z',
      displayLabel: 'Mars 2026',
      currentBalance: 4000,
      projectedBalance: 150.3,
      budgetGroups: [],
      chargeGroups: [
        {
          title: 'Charges de Mars 2026',
          charges: [
            { id: 'o-1', icon: '🏠', label: 'Loyer 2', amount: 100, taken: false },
            { id: 'o-2', icon: '💰', label: 'Adobe', amount: 26.21, taken: false },
          ],
        },
      ],
      outflows: [
        { id: 'o-1', pendingFrom: null, label: '🏠 Loyer 2', amount: 100, isChecked: false },
        { id: 'o-2', pendingFrom: null, label: 'Adobe', amount: 26.21, isChecked: false },
      ],
    };

    const toggled = applyOutflowToggleToMonthView(month, { outflowId: 'o-1', isChecked: true });
    const payload = buildOutflowsCheckingPayload(toggled);

    expect(payload).toEqual({
      currentBalance: 4000,
      outflows: [
        { id: 'o-1', pendingFrom: null, label: '🏠 Loyer 2', amount: 100, isChecked: true },
        { id: 'o-2', pendingFrom: null, label: 'Adobe', amount: 26.21, isChecked: false },
      ],
    });
  });
});
