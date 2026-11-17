/**
 * Ouverture des drawers d’édition d’une ligne (dépense, charge, budget) pré-remplis.
 * Partagé par les lignes des écrans et par les drawers de recherche.
 * `onSubmit` reçoit le libellé API (emoji + texte) et le montant numérique, déjà validé (> 0).
 */
import type { BuddjExpenseAddDrawerElement } from '../components/organisms/buddj-expense-add-drawer.js';
import type { BuddjChargeAddDrawerElement } from '../components/organisms/buddj-charge-add-drawer.js';
import type { BuddjBudgetAddDrawerElement } from '../components/organisms/buddj-budget-add-drawer.js';
import { getToast } from '../components/atoms/buddj-toast.js';
import { formatEuros, parseEurosToNumber } from './goal.js';

export type LineEditValues = {
  /** Libellé sans emoji. */
  label: string;
  icon: string;
  amount: number;
  onSubmit: (apiLabel: string, amount: number) => void;
};

function toApiLabel(emoji: string, label: string): string {
  return `${emoji.trim()} ${label.trim()}`.trim();
}

function submitIfPositive(
  { label, amountText, emoji }: { label: string; amountText: string; emoji: string },
  onSubmit: LineEditValues['onSubmit'],
): void {
  const amount = parseEurosToNumber(amountText);
  if (amount <= 0) {
    getToast()?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
    return;
  }
  onSubmit(toApiLabel(emoji, label), amount);
}

export function openExpenseEditDrawer({ label, icon, amount, onSubmit }: LineEditValues): void {
  const drawer = document.getElementById('expense-add-drawer') as BuddjExpenseAddDrawerElement | null;
  drawer?.open({
    title: 'Modifier la dépense',
    initialLabel: label,
    initialAmount: formatEuros(amount),
    initialEmoji: icon || undefined,
    onValidate: onSubmit,
  });
}

export function openChargeEditDrawer({ label, icon, amount, onSubmit }: LineEditValues): void {
  const drawer = document.getElementById('charge-add-drawer') as BuddjChargeAddDrawerElement | null;
  drawer?.open({
    title: 'Modifier la charge',
    initialLabel: label,
    initialAmount: formatEuros(amount),
    initialEmoji: icon || undefined,
    silentValidate: true,
    onValidate: (newLabel, amountText, emoji) => submitIfPositive({ label: newLabel, amountText, emoji }, onSubmit),
  });
}

export function openBudgetEditDrawer({ label, icon, amount, onSubmit }: LineEditValues): void {
  const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement | null;
  drawer?.open({
    title: 'Modifier le budget',
    initialLabel: label,
    initialAmount: formatEuros(amount),
    initialEmoji: icon || undefined,
    onValidate: (newLabel, amountText, emoji) => submitIfPositive({ label: newLabel, amountText, emoji }, onSubmit),
  });
}
