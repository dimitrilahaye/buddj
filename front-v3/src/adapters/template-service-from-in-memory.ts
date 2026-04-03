import type { DefaultNewMonthBundle } from '../application/new-month/default-new-month-bundle.js';
import { emptyPendingDebits } from '../application/new-month/default-new-month-bundle.js';
import type { TemplateService } from '../application/template/template-service.js';
import type { TemplateView } from '../application/template/template-view.js';

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/**
 * État mutable en closure pour les tests.
 */
export function createTemplateServiceFromInMemory({
  templates: initialTemplates,
  defaultForNewMonth,
  delayMs = 0,
}: {
  templates: TemplateView[];
  /** Si absent : premier template `isDefault`, sinon premier de la liste, avec pending vides. */
  defaultForNewMonth?: DefaultNewMonthBundle;
  delayMs?: number;
}): TemplateService {
  const templates = deepClone(initialTemplates);
  const defaultBundle: DefaultNewMonthBundle =
    defaultForNewMonth ??
    (() => {
      const def = templates.find((t) => t.isDefault) ?? templates[0];
      if (!def) return { template: null, pendingDebits: emptyPendingDebits() };
      return { template: deepClone(def), pendingDebits: emptyPendingDebits() };
    })();

  async function tick(): Promise<void> {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }

  return {
    async getDefaultForNewMonth() {
      await tick();
      return deepClone(defaultBundle);
    },

    async getAllTemplates() {
      await tick();
      return deepClone(templates);
    },

    async updateTemplate({ templateId, name, isDefault }) {
      await tick();
      const idx = templates.findIndex((t) => t.id === templateId);
      if (idx < 0) throw new Error(`Template introuvable : ${templateId}`);
      const t = templates[idx]!;
      t.name = name;
      if (isDefault) {
        templates.forEach((x) => {
          x.isDefault = x.id === templateId;
        });
      } else {
        t.isDefault = false;
      }
      return deepClone(t);
    },

    async addTemplateOutflow({ templateId, label, amount }) {
      await tick();
      const t = templates.find((x) => x.id === templateId);
      if (!t) throw new Error(`Template introuvable : ${templateId}`);
      const id = crypto.randomUUID();
      t.outflows = [...t.outflows, { id, label, amount, isChecked: false, pendingFrom: null }];
      return deepClone(t);
    },

    async deleteTemplateOutflow({ templateId, outflowId }) {
      await tick();
      const t = templates.find((x) => x.id === templateId);
      if (!t) throw new Error(`Template introuvable : ${templateId}`);
      const next = t.outflows.filter((o) => o.id !== outflowId);
      if (next.length === t.outflows.length) throw new Error(`Charge introuvable : ${outflowId}`);
      t.outflows = next;
      return deepClone(t);
    },

    async addTemplateBudget({ templateId, name, initialBalance }) {
      await tick();
      const t = templates.find((x) => x.id === templateId);
      if (!t) throw new Error(`Template introuvable : ${templateId}`);
      const id = crypto.randomUUID();
      t.budgets = [...t.budgets, { id, name, initialBalance, pendingFrom: null }];
      return deepClone(t);
    },

    async deleteTemplateBudget({ templateId, budgetId }) {
      await tick();
      const t = templates.find((x) => x.id === templateId);
      if (!t) throw new Error(`Template introuvable : ${templateId}`);
      const next = t.budgets.filter((b) => b.id !== budgetId);
      if (next.length === t.budgets.length) throw new Error(`Budget introuvable : ${budgetId}`);
      t.budgets = next;
      return deepClone(t);
    },
  };
}
