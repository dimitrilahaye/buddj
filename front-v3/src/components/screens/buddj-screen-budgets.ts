/**
 * Écran Mes budgets : header + groupes de budgets construits à partir d’un tableau de données.
 */
import type { BuddjExpenseSearchDrawerElement } from '../organisms/buddj-expense-search-drawer.js';

export interface BudgetExpense {
  icon: string;
  desc: string;
  amount: number;
  taken?: boolean;
}

export interface Budget {
  name: string;
  icon: string;
  allocated: number;
  expenses: BudgetExpense[];
}

export interface BudgetGroupData {
  title: string;
  previous?: boolean;
  /** Groupe de budgets annuels (à faire ressortir au-dessus des budgets du mois). */
  annual?: boolean;
  showAdd?: boolean;
  budgets: Budget[];
}

const BUDGET_GROUPS: BudgetGroupData[] = [
  {
    title: 'Budgets des mois précédents',
    previous: true,
    budgets: [
      {
        name: 'Entretien voiture',
        icon: '🚗',
        allocated: 80,
        expenses: [
          { icon: '🛢️', desc: 'Vidange', amount: 25, taken: true },
          { icon: '🛞', desc: 'Contrôle technique', amount: 35, taken: true },
          { icon: '⛽', desc: 'Plein', amount: 12 },
          { icon: '🧴', desc: 'Liquide lave-glace', amount: 8 },
        ],
      },
    ],
  },
  {
    title: 'Budgets annuels',
    annual: true,
    budgets: [
      {
        name: 'Assurance habitation',
        icon: '🛡️',
        allocated: 420,
        expenses: [
          { icon: '📋', desc: 'Prime annuelle', amount: 420, taken: true },
        ],
      },
      {
        name: 'Entretien maison',
        icon: '🏠',
        allocated: 500,
        expenses: [
          { icon: '🔧', desc: 'Chaudière', amount: 120, taken: true },
          { icon: '🪟', desc: 'Vitrier', amount: 80 },
        ],
      },
    ],
  },
  {
    title: "Budgets d'Avril 2024",
    showAdd: true,
    budgets: [
      {
        name: 'Vacances',
        icon: '🏖️',
        allocated: 350,
        expenses: [
          { icon: '🚄', desc: 'Billet train', amount: 45, taken: true },
          { icon: '🏨', desc: 'Réservation hôtel deux nuits avec petit-déjeuner inclus au bord de la mer', amount: 90 },
          { icon: '🚗', desc: 'Location voiture 3 jours', amount: 75, taken: true },
          { icon: '🎫', desc: 'Activités (plongée, visite)', amount: 40 },
          { icon: '🍽️', desc: 'Restaurant sur place', amount: 30, taken: true },
          { icon: '🎁', desc: 'Souvenirs', amount: 15 },
        ],
      },
      {
        name: 'Sorties',
        icon: '🎬',
        allocated: 120,
        expenses: [
          { icon: '🍽️', desc: 'Restaurant', amount: 42, taken: true },
          { icon: '🎬', desc: 'Cinéma', amount: 14 },
          { icon: '🍺', desc: 'Bar', amount: 22, taken: true },
          { icon: '🎸', desc: 'Concert', amount: 38 },
          { icon: '☕', desc: 'Café', amount: 12, taken: true },
        ],
      },
    ],
  },
];

export class BuddjScreenBudgets extends HTMLElement {
  static readonly tagName = 'buddj-screen-budgets';

  connectedCallback(): void {
    if (this.querySelector('.budget-list')) return;
    const main = document.createElement('main');
    main.id = 'budgets';
    main.className = 'screen screen--budgets';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap">
        <header class="screen-header">
          <div class="screen-header-row screen-header-row--title">
            <h1 class="title">Mes budgets</h1>
            <buddj-icon-search title="Rechercher par intitulé ou montant" aria-label="Ouvrir la recherche"></buddj-icon-search>
            <buddj-toggle-all target-selector=".budget-details" title-expand="Déplier tous les budgets" title-collapse="Replier tous les budgets"></buddj-toggle-all>
          </div>
        </header>
      </div>
      <section class="budget-list"></section>
    `;
    const listSection = main.querySelector('.budget-list')!;
    for (const group of BUDGET_GROUPS) {
      const groupEl = document.createElement('buddj-budget-group');
      groupEl.setAttribute('title', group.title);
      if (group.previous) groupEl.setAttribute('previous', '');
      if (group.annual) groupEl.setAttribute('annual', '');
      if (group.showAdd) groupEl.setAttribute('show-add', '');
      for (const budget of group.budgets) {
        const cardEl = document.createElement('buddj-budget-card');
        cardEl.setAttribute('name', budget.name);
        cardEl.setAttribute('icon', budget.icon);
        cardEl.setAttribute('allocated', String(budget.allocated));
        for (const exp of budget.expenses) {
          const itemEl = document.createElement('buddj-expense-item');
          itemEl.setAttribute('icon', exp.icon);
          itemEl.setAttribute('desc', exp.desc);
          itemEl.setAttribute('amount', String(exp.amount));
          if (exp.taken) itemEl.setAttribute('taken', '');
          cardEl.appendChild(itemEl);
        }
        groupEl.appendChild(cardEl);
      }
      listSection.appendChild(groupEl);
    }
    this.appendChild(main);
    this.attachListeners();
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('buddj-icon-search')) {
        e.preventDefault();
        const drawer = document.getElementById('expense-search-drawer') as BuddjExpenseSearchDrawerElement;
        drawer?.open();
        return;
      }
    });
  }
}

customElements.define(BuddjScreenBudgets.tagName, BuddjScreenBudgets);
