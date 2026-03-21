import { applyCheckingPayloadToMonthView } from '../application/month/expenses-checking-payload.js';
import type { MonthService } from '../application/month/month-service.js';
import type { MonthView } from '../application/month/month-view.js';

function deepCloneMonths(source: MonthView[]): MonthView[] {
  return JSON.parse(JSON.stringify(source)) as MonthView[];
}

/**
 * État mutable en closure : `getUnarchivedMonths` et `putExpensesChecking` partagent les mêmes mois
 * (simule la persistance après PUT expenses/checking).
 */
export function createMonthServiceFromInMemory({
  months: initialMonths,
  delayMs = 0,
  putDelayMs,
}: {
  months: MonthView[];
  /** Délai simulé pour `getUnarchivedMonths`. */
  delayMs?: number;
  /** Délai simulé pour `putExpensesChecking` (défaut : `delayMs`). */
  putDelayMs?: number;
}): MonthService {
  let months = deepCloneMonths(initialMonths);
  const waitPut = putDelayMs ?? delayMs;
  return {
    async getUnarchivedMonths() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return deepCloneMonths(months);
    },
    async putExpensesChecking(monthId, body) {
      if (waitPut > 0) await new Promise((r) => setTimeout(r, waitPut));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = applyCheckingPayloadToMonthView(months[idx], body);
      // Simule un solde prévisionnel recalculé côté serveur (ex. dashboard.account.forecastBalance)
      updated.projectedBalance = Math.round((updated.projectedBalance + 73.6) * 10) / 10;
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
  };
}
