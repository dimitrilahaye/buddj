import { NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';

@Component({
  selector: 'app-menu-footer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu-footer.component.html',
  styleUrl: './menu-footer.component.scss',
})
export class MenuFooterComponent {
  constructor(
    private router: Router,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface
  ) {}

  plusOpen = false;

  toggle() {
    this.plusOpen = !this.plusOpen;
  }

  navigateToExpenses() {
    this.monthlyBudgetsStore.askForNewExpense();
    this.toggle();
    this.router.navigate(['/home', 'expenses']);
  }

  navigateToOutflows() {
    this.monthlyBudgetsStore.askForNewOutflow();
    this.toggle();
    this.router.navigate(['/home', 'outflows']);
  }

  navigateToMonthCreation() {
    this.router.navigate(['month-creation']);
  }
}
