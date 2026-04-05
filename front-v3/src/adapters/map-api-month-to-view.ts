import { splitLeadingEmoji } from '../shared/emoji-label.js';
import type { Budget, BudgetGroupData, ChargeGroupData, ChargeItemData, OutflowData } from '../application/month/month-types.js';
import type { MonthView } from '../application/month/month-view.js';

const DEFAULT_ITEM_ICON = '💰';

type ApiWeeklyBudgetRow = {
  id: string;
  name: string;
  pendingFrom: string | null;
  expenses: Array<{ id: string; amount: number; label: string; isChecked: boolean }>;
};

type ApiOutflowRow = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom: string | null;
};

type ApiDashboardWeekRow = {
  weekId?: string;
  weekName?: string;
  currentBalance?: number;
  initialBalance?: number;
};

export type ApiMonthPayload = {
  id: string;
  date: string | Date;
  dashboard: {
    account: {
      currentBalance: number;
      forecastBalance: number;
    };
    weeks: {
      weeklyBudgets: ApiDashboardWeekRow[];
    };
  };
  account: {
    id: string;
    currentBalance: number;
    outflows?: ApiOutflowRow[];
    weeklyBudgets: ApiWeeklyBudgetRow[];
  };
};

function formatDisplayLabelFr({ isoDate }: { isoDate: string }): string {
  const d = new Date(isoDate);
  const raw = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function mapWeeklyBudgetToBudget({
  wb,
  dashWeeks,
}: {
  wb: ApiWeeklyBudgetRow;
  dashWeeks: ApiDashboardWeekRow[];
}): Budget {
  const { icon, text } = splitLeadingEmoji({ label: wb.name, defaultIcon: DEFAULT_ITEM_ICON });
  const dash = dashWeeks.find((w) => w.weekId === wb.id);
  const sumExpenses = wb.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const allocated =
    dash?.initialBalance != null && !Number.isNaN(Number(dash.initialBalance))
      ? Number(dash.initialBalance)
      : sumExpenses;
  return {
    name: text,
    icon,
    allocated,
    weeklyBudgetId: wb.id,
    expenses: wb.expenses.map((e) => {
      const pe = splitLeadingEmoji({ label: e.label, defaultIcon: DEFAULT_ITEM_ICON });
      return {
        id: e.id,
        icon: pe.icon,
        desc: pe.text,
        amount: Number(e.amount),
        taken: e.isChecked,
      };
    }),
  };
}

export function mapApiMonthPayloadToView(payload: ApiMonthPayload): MonthView {
  const isoDate =
    typeof payload.date === 'string'
      ? payload.date
      : payload.date instanceof Date
        ? payload.date.toISOString()
        : '';
  const displayLabel = formatDisplayLabelFr({ isoDate });
  const dashWeeks = payload.dashboard?.weeks?.weeklyBudgets ?? [];
  const weekly = payload.account?.weeklyBudgets ?? [];
  const outflows = payload.account?.outflows ?? [];

  const previousBudgets = weekly
    .filter((w) => w.pendingFrom != null)
    .map((w) => mapWeeklyBudgetToBudget({ wb: w, dashWeeks }));
  const currentBudgets = weekly
    .filter((w) => w.pendingFrom == null)
    .map((w) => mapWeeklyBudgetToBudget({ wb: w, dashWeeks }));

  const budgetGroups: BudgetGroupData[] = [];
  if (previousBudgets.length > 0) {
    budgetGroups.push({
      title: 'Budgets des mois précédents',
      previous: true,
      budgets: previousBudgets,
    });
  }
  if (currentBudgets.length > 0) {
    budgetGroups.push({
      title: `Budgets de ${displayLabel}`,
      showAdd: true,
      budgets: currentBudgets,
    });
  }

  const toOutflowData = (o: ApiOutflowRow): OutflowData => ({
    id: o.id,
    pendingFrom: o.pendingFrom,
    label: o.label,
    amount: Number(o.amount),
    isChecked: !!o.isChecked,
  });
  const outflowsData = outflows.map(toOutflowData);
  const toCharge = (o: OutflowData): ChargeItemData => {
    const parsed = splitLeadingEmoji({ label: o.label, defaultIcon: DEFAULT_ITEM_ICON });
    return {
      id: o.id,
      icon: parsed.icon,
      label: parsed.text,
      amount: Number(o.amount),
      taken: !!o.isChecked,
      previous: o.pendingFrom != null,
    };
  };
  const previousOutflows = outflowsData.filter((o) => o.pendingFrom != null).map(toCharge);
  const currentOutflows = outflowsData.filter((o) => o.pendingFrom == null).map(toCharge);
  const chargeGroups: ChargeGroupData[] = [];
  if (previousOutflows.length > 0) {
    chargeGroups.push({
      previous: true,
      title: 'Charges des mois précédents',
      charges: previousOutflows,
    });
  }
  if (currentOutflows.length > 0) {
    chargeGroups.push({
      title: `Charges de ${displayLabel}`,
      showAdd: true,
      addLabel: 'Ajouter une charge',
      addTitle: 'Ajouter une charge récurrente',
      charges: currentOutflows,
    });
  }

  return {
    id: payload.id,
    accountId: payload.account?.id ?? '',
    isoDate,
    displayLabel,
    currentBalance: Number(payload.account?.currentBalance ?? 0),
    projectedBalance: Number(payload.dashboard?.account?.forecastBalance ?? 0),
    budgetGroups,
    chargeGroups,
    outflows: outflowsData,
  };
}
