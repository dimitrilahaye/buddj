import { addBudgetToMonthView } from '../application/month/add-budget-to-month-view.js';
import { addExpenseToMonthView } from '../application/month/add-expense-to-month-view.js';
import { applyCheckingPayloadToMonthView } from '../application/month/expenses-checking-payload.js';
import { applyOutflowsCheckingPayloadToMonthView } from '../application/month/outflows-checking-payload.js';
import type { MonthService } from '../application/month/month-service.js';
import type { MonthView } from '../application/month/month-view.js';
import type { CreateMonthApiBody } from '../application/new-month/default-new-month-bundle.js';
import { removeBudgetFromMonthView } from '../application/month/remove-budget-from-month-view.js';
import { updateBudgetInMonthView } from '../application/month/update-budget-in-month-view.js';
import { removeExpenseFromMonthView } from '../application/month/remove-expense-from-month-view.js';
import { splitLeadingEmoji } from '../shared/emoji-label.js';

function deepCloneMonths(source: MonthView[]): MonthView[] {
  return JSON.parse(JSON.stringify(source)) as MonthView[];
}

/**
 * État mutable en closure : les opérations partagent les mêmes mois en mémoire.
 */
export function createMonthServiceFromInMemory({
  months: initialMonths,
  archivedMonths: initialArchivedMonths,
  delayMs = 0,
  putDelayMs,
  putOutflowsDelayMs,
  deleteDelayMs,
  deleteOutflowDelayMs,
  deleteBudgetDelayMs,
  createExpenseDelayMs,
  createOutflowDelayMs,
  createBudgetDelayMs,
  updateBudgetDelayMs,
  transferDelayMs,
  archiveMonthDelayMs,
  archiveMonthFailure,
  createMonthDelayMs,
}: {
  months: MonthView[];
  /** Mois déjà archivés (tests écran archivés). */
  archivedMonths?: MonthView[];
  /** Délai simulé pour `getUnarchivedMonths`. */
  delayMs?: number;
  /** Délai simulé pour `putExpensesChecking` (défaut : `delayMs`). */
  putDelayMs?: number;
  /** Délai simulé pour `putOutflowsChecking` (défaut : `delayMs`). */
  putOutflowsDelayMs?: number;
  /** Délai simulé pour `deleteExpense` (défaut : `delayMs`). */
  deleteDelayMs?: number;
  /** Délai simulé pour `deleteOutflow` (défaut : `delayMs`). */
  deleteOutflowDelayMs?: number;
  /** Délai simulé pour `deleteBudget` (défaut : `delayMs`). */
  deleteBudgetDelayMs?: number;
  /** Délai simulé pour `createExpense` (défaut : `delayMs`). */
  createExpenseDelayMs?: number;
  /** Délai simulé pour `createOutflow` (défaut : `delayMs`). */
  createOutflowDelayMs?: number;
  /** Délai simulé pour `createBudget` (défaut : `delayMs`). */
  createBudgetDelayMs?: number;
  /** Délai simulé pour `updateBudget` (défaut : `delayMs`). */
  updateBudgetDelayMs?: number;
  /** Délai simulé pour `transferFromWeeklyBudget` (défaut : `delayMs`). */
  transferDelayMs?: number;
  /** Délai simulé pour `archiveMonth` (défaut : `delayMs`). */
  archiveMonthDelayMs?: number;
  /** Si défini, `archiveMonth` échoue avec ce message (tests). */
  archiveMonthFailure?: string;
  /** Délai simulé pour `createMonth` (défaut : `delayMs`). */
  createMonthDelayMs?: number;
}): MonthService {
  const months = deepCloneMonths(initialMonths);
  const archivedMonths = deepCloneMonths(initialArchivedMonths ?? []);
  const waitPut = putDelayMs ?? delayMs;
  const waitPutOutflows = putOutflowsDelayMs ?? delayMs;
  const waitDelete = deleteDelayMs ?? delayMs;
  const waitDeleteOutflow = deleteOutflowDelayMs ?? delayMs;
  const waitDeleteBudget = deleteBudgetDelayMs ?? delayMs;
  const waitCreateExpense = createExpenseDelayMs ?? delayMs;
  const waitCreateOutflow = createOutflowDelayMs ?? delayMs;
  const waitCreateBudget = createBudgetDelayMs ?? delayMs;
  const waitUpdateBudget = updateBudgetDelayMs ?? delayMs;
  const waitTransfer = transferDelayMs ?? delayMs;
  const waitArchiveMonth = archiveMonthDelayMs ?? delayMs;
  const waitCreateMonth = createMonthDelayMs ?? delayMs;
  const archiveFailMessage = archiveMonthFailure;
  return {
    async createMonth({ body }: { body: CreateMonthApiBody }) {
      if (waitCreateMonth > 0) await new Promise((r) => setTimeout(r, waitCreateMonth));
      const iso =
        typeof body.month === 'string' && body.month.length >= 10
          ? body.month
          : `${String(body.month).slice(0, 7)}-01T00:00:00.000Z`;
      const id = iso.slice(0, 7);
      const d = new Date(iso);
      const displayLabel =
        new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d);
      const capitalized = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
      const created: MonthView = {
        id,
        isoDate: iso,
        displayLabel: capitalized,
        currentBalance: body.startingBalance,
        projectedBalance: body.startingBalance,
        budgetGroups: [],
        chargeGroups: [],
        outflows: [],
      };
      const idx = months.findIndex((m) => m.id === id);
      if (idx >= 0) months[idx] = created;
      else months.push(created);
      months.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
      return deepCloneMonths([created])[0]!;
    },

    async getUnarchivedMonths() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return deepCloneMonths(months);
    },
    async getArchivedMonths() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return deepCloneMonths(archivedMonths);
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
    async putOutflowsChecking({ monthId, body }) {
      if (waitPutOutflows > 0) await new Promise((r) => setTimeout(r, waitPutOutflows));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = applyOutflowsCheckingPayloadToMonthView(months[idx], body);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async deleteExpense({ monthId, weeklyBudgetId, expenseId }) {
      if (waitDelete > 0) await new Promise((r) => setTimeout(r, waitDelete));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = removeExpenseFromMonthView(months[idx], weeklyBudgetId, expenseId);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async deleteOutflow({ monthId, outflowId }) {
      if (waitDeleteOutflow > 0) await new Promise((r) => setTimeout(r, waitDeleteOutflow));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = removeOutflowFromMonthView({ month: months[idx], outflowId });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async createExpense({ monthId, weeklyBudgetId, label, amount }) {
      if (waitCreateExpense > 0) await new Promise((r) => setTimeout(r, waitCreateExpense));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const expenseId = crypto.randomUUID();
      const updated = addExpenseToMonthView(months[idx], weeklyBudgetId, {
        id: expenseId,
        apiLabel: label,
        amount,
      });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async createBudget({ monthId, name, initialBalance }) {
      if (waitCreateBudget > 0) await new Promise((r) => setTimeout(r, waitCreateBudget));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const weeklyBudgetId = crypto.randomUUID();
      const updated = addBudgetToMonthView(months[idx], {
        weeklyBudgetId,
        apiName: name,
        initialBalance,
      });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async createOutflow({ monthId, label, amount }) {
      if (waitCreateOutflow > 0) await new Promise((r) => setTimeout(r, waitCreateOutflow));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = addOutflowToMonthView({ month: months[idx], label, amount });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async deleteBudget({ monthId, budgetId }) {
      if (waitDeleteBudget > 0) await new Promise((r) => setTimeout(r, waitDeleteBudget));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const month = months[idx];
      if (weeklyBudgetHasUncheckedExpense(month, budgetId)) {
        throw new Error('Vous ne pouvez pas supprimer ce budget');
      }
      const updated = removeBudgetFromMonthView(month, budgetId);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async updateBudget({ monthId, budgetId, name }) {
      if (waitUpdateBudget > 0) await new Promise((r) => setTimeout(r, waitUpdateBudget));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = updateBudgetInMonthView(months[idx], budgetId, name);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async transferFromWeeklyBudget({ monthId, fromWeeklyBudgetId, destinationType, destinationId, amount }) {
      if (waitTransfer > 0) await new Promise((r) => setTimeout(r, waitTransfer));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = transferFromWeeklyBudgetInMonthView({
        month: months[idx],
        fromWeeklyBudgetId,
        destinationType,
        destinationId,
        amount,
      });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async transferFromAccount({ monthId, fromAccountId, toWeeklyBudgetId, amount }) {
      if (waitTransfer > 0) await new Promise((r) => setTimeout(r, waitTransfer));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = transferFromAccountInMonthView({
        month: months[idx],
        fromAccountId,
        toWeeklyBudgetId,
        amount,
      });
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async archiveMonth({ monthId }) {
      if (waitArchiveMonth > 0) await new Promise((r) => setTimeout(r, waitArchiveMonth));
      if (archiveFailMessage) throw new Error(archiveFailMessage);
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const archived = deepCloneMonths([months[idx]!])[0]!;
      months.splice(idx, 1);
      archivedMonths.push(archived);
      return archived;
    },
    async unarchiveMonth({ monthId }) {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      const idx = archivedMonths.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois archivé introuvable : ${monthId}`);
      const restored = deepCloneMonths([archivedMonths[idx]!])[0]!;
      archivedMonths.splice(idx, 1);
      months.push(restored);
      return deepCloneMonths(months);
    },
    async deleteArchivedMonth({ monthId }) {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      const idx = archivedMonths.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois archivé introuvable : ${monthId}`);
      archivedMonths.splice(idx, 1);
      return deepCloneMonths(archivedMonths);
    },
  };
}

function addOutflowToMonthView({
  month,
  label,
  amount,
}: {
  month: MonthView;
  label: string;
  amount: number;
}): MonthView {
  const next: MonthView = deepCloneMonths([month])[0]!;
  const currentGroupIdx = (next.chargeGroups ?? []).findIndex((g) => !g.previous);
  const parsed = splitLeadingEmoji({ label, defaultIcon: '💰' });
  const outflowId = crypto.randomUUID();
  next.outflows = [
    ...(next.outflows ?? []),
    {
      id: outflowId,
      pendingFrom: null,
      label,
      amount,
      isChecked: false,
    },
  ];
  const newCharge = {
    id: outflowId,
    icon: parsed.icon,
    label: parsed.text,
    amount,
    taken: false,
  };
  if (!next.chargeGroups || next.chargeGroups.length === 0) {
    next.chargeGroups = [
      {
        title: `Charges de ${next.displayLabel}`,
        showAdd: true,
        addLabel: 'Ajouter une charge',
        addTitle: 'Ajouter une charge récurrente',
        charges: [newCharge],
      },
    ];
    return next;
  }
  if (currentGroupIdx < 0) {
    next.chargeGroups.push({
      title: `Charges de ${next.displayLabel}`,
      showAdd: true,
      addLabel: 'Ajouter une charge',
      addTitle: 'Ajouter une charge récurrente',
      charges: [newCharge],
    });
    return next;
  }
  next.chargeGroups[currentGroupIdx] = {
    ...next.chargeGroups[currentGroupIdx],
    charges: [...next.chargeGroups[currentGroupIdx]!.charges, newCharge],
  };
  return next;
}

function removeOutflowFromMonthView({
  month,
  outflowId,
}: {
  month: MonthView;
  outflowId: string;
}): MonthView {
  const next: MonthView = deepCloneMonths([month])[0]!;
  next.outflows = (next.outflows ?? []).filter((o) => o.id !== outflowId);
  next.chargeGroups = (next.chargeGroups ?? [])
    .map((group) => ({
      ...group,
      charges: group.charges.filter((c) => c.id !== outflowId),
    }))
    .filter((group) => group.previous || group.charges.length > 0);
  return next;
}

function weeklyBudgetHasUncheckedExpense(month: MonthView, weeklyBudgetId: string): boolean {
  for (const g of month.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== weeklyBudgetId) continue;
      return b.expenses.some((e) => !e.taken);
    }
  }
  return false;
}

function transferFromWeeklyBudgetInMonthView({
  month,
  fromWeeklyBudgetId,
  destinationType,
  destinationId,
  amount,
}: {
  month: MonthView;
  fromWeeklyBudgetId: string;
  destinationType: 'weekly-budget' | 'account';
  destinationId: string;
  amount: number;
}): MonthView {
  const next: MonthView = deepCloneMonths([month])[0]!;
  let sourceFound = false;
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== fromWeeklyBudgetId) continue;
      sourceFound = true;
      b.allocated = Math.round((b.allocated - amount) * 100) / 100;
    }
  }
  if (!sourceFound) throw new Error(`Budget source introuvable : ${fromWeeklyBudgetId}`);

  if (destinationType === 'weekly-budget') {
    let destinationFound = false;
    for (const g of next.budgetGroups) {
      for (const b of g.budgets) {
        if (b.weeklyBudgetId !== destinationId) continue;
        destinationFound = true;
        b.allocated = Math.round((b.allocated + amount) * 100) / 100;
      }
    }
    if (!destinationFound) throw new Error(`Budget destination introuvable : ${destinationId}`);
    return next;
  }

  if (next.accountId && destinationId !== next.accountId) {
    throw new Error(`Compte destination introuvable : ${destinationId}`);
  }
  next.projectedBalance = Math.round((next.projectedBalance + amount) * 100) / 100;
  return next;
}

function transferFromAccountInMonthView({
  month,
  fromAccountId,
  toWeeklyBudgetId,
  amount,
}: {
  month: MonthView;
  fromAccountId: string;
  toWeeklyBudgetId: string;
  amount: number;
}): MonthView {
  const next: MonthView = deepCloneMonths([month])[0]!;
  if (next.accountId && next.accountId !== fromAccountId) {
    throw new Error(`Compte source introuvable : ${fromAccountId}`);
  }
  let destinationFound = false;
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== toWeeklyBudgetId) continue;
      destinationFound = true;
      b.allocated = Math.round((b.allocated + amount) * 100) / 100;
    }
  }
  if (!destinationFound) throw new Error(`Budget destination introuvable : ${toWeeklyBudgetId}`);
  next.projectedBalance = Math.round((next.projectedBalance - amount) * 100) / 100;
  return next;
}
