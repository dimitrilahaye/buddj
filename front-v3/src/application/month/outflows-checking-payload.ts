import type { MonthView } from './month-view.js';

export type OutflowsCheckingPayload = {
  currentBalance: number;
  outflows: Array<{
    id: string;
    pendingFrom: string | null;
    label: string;
    amount: number;
    isChecked: boolean;
  }>;
};

function cloneMonthView(month: MonthView): MonthView {
  return JSON.parse(JSON.stringify(month)) as MonthView;
}

export function applyOutflowToggleToMonthView(
  month: MonthView,
  detail: { outflowId: string; isChecked: boolean }
): MonthView {
  const next = cloneMonthView(month);
  if (!next.outflows) return next;
  const outflow = next.outflows.find((o) => o.id === detail.outflowId);
  if (outflow) outflow.isChecked = detail.isChecked;
  if (next.chargeGroups) {
    for (const group of next.chargeGroups) {
      for (const charge of group.charges) {
        if (charge.id === detail.outflowId) charge.taken = detail.isChecked;
      }
    }
  }
  return next;
}

export function buildOutflowsCheckingPayload(month: MonthView): OutflowsCheckingPayload {
  const outflows = (month.outflows ?? []).map((o) => ({
    id: o.id,
    pendingFrom: o.pendingFrom,
    label: o.label,
    amount: o.amount,
    isChecked: o.isChecked,
  }));
  return {
    currentBalance: month.currentBalance,
    outflows,
  };
}

export function applyOutflowsCheckingPayloadToMonthView(
  month: MonthView,
  body: OutflowsCheckingPayload
): MonthView {
  const next = cloneMonthView(month);
  next.outflows = body.outflows.map((o) => ({ ...o }));
  if (next.chargeGroups) {
    for (const group of next.chargeGroups) {
      for (const charge of group.charges) {
        const matching = body.outflows.find((o) => o.id === charge.id);
        if (matching) charge.taken = matching.isChecked;
      }
    }
  }
  return next;
}
