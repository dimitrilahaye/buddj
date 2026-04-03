import type { YearlyOutflowsService } from '../application/yearly-outflows/yearly-outflows-service.js';
import {
  createEmptyYearlyOutflowsView,
  type YearlyOutflowsView,
} from '../application/yearly-outflows/yearly-outflows-view.js';

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `yearly-test-id-${idCounter}`;
}

function cloneView(view: YearlyOutflowsView): YearlyOutflowsView {
  return {
    months: view.months.map((m) => ({
      outflows: m.outflows.map((o) => ({ ...o })),
      budgets: m.budgets.map((b) => ({ ...b })),
    })),
  };
}

export function createYearlyOutflowsServiceFromInMemory({
  initial,
  delayMs = 0,
}: {
  initial?: YearlyOutflowsView;
  delayMs?: number;
}): YearlyOutflowsService {
  let state = cloneView(initial ?? createEmptyYearlyOutflowsView());

  const delay = async (): Promise<void> => {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  };

  return {
    async getAll() {
      await delay();
      return cloneView(state);
    },
    async add(input) {
      await delay();
      const idx = input.month - 1;
      if (idx < 0 || idx > 11) {
        throw new Error('Mois invalide');
      }
      const next = cloneView(state);
      if (input.kind === 'outflow') {
        next.months[idx]!.outflows.push({
          id: nextId(),
          month: input.month,
          label: input.label.trim(),
          amount: input.amount,
        });
      } else {
        next.months[idx]!.budgets.push({
          id: nextId(),
          month: input.month,
          name: input.label.trim(),
          initialBalance: input.amount,
        });
      }
      state = next;
      return cloneView(state);
    },
    async remove({ id }) {
      await delay();
      const next = cloneView(state);
      let found = false;
      for (const m of next.months) {
        const oi = m.outflows.findIndex((o) => o.id === id);
        if (oi >= 0) {
          m.outflows.splice(oi, 1);
          found = true;
          break;
        }
        const bi = m.budgets.findIndex((b) => b.id === id);
        if (bi >= 0) {
          m.budgets.splice(bi, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Élément introuvable');
      }
      state = next;
      return cloneView(state);
    },
  };
}
