import { Component, Inject, Signal } from '@angular/core';
import { MenuFooterComponent } from '../menu-footer/menu-footer.component';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuFooterComponent, DateNormalizePipe, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  monthlyBudgets: Signal<MonthlyBudget[]> | null = null;

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface
  ) {
    this.monthlyBudgets = this.monthlyBudgetsStore.getAll();
  }

  get currentMonth() {
    if (!this.monthlyBudgets || !this.monthlyBudgets()[0]) {
      return null;
    }

    return this.monthlyBudgets()[0];
  }
}
