import { Component, Inject, signal, Signal } from '@angular/core';
import { MenuFooterComponent } from '../menu-footer/menu-footer.component';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CurrencyPipe } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { finalize } from 'rxjs';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { OutflowsComponent } from '../outflows/outflows.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MenuFooterComponent,
    DateNormalizePipe,
    CurrencyPipe,
    DesignSystemModule,
    OutflowsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  currentMonthlyBudget: Signal<MonthlyBudget | null> | null = null;
  isCurrentMonthTheFirst: Signal<boolean> = signal(true);
  isCurrentMonthTheLast: Signal<boolean> = signal(false);
  displayLoader = false;

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface
  ) {
    if (!this.currentMonthlyBudget) {
      this.displayLoader = true;
      this.monthsService
        .getUnarchivedMonths()
        .pipe(
          finalize(() => {
            this.displayLoader = false;
          })
        )
        .subscribe(() => {
          this.currentMonthlyBudget = this.monthlyBudgetsStore.getCurrent();
          this.isCurrentMonthTheFirst =
            this.monthlyBudgetsStore.isCurrentMonthTheFirst();
          this.isCurrentMonthTheLast =
            this.monthlyBudgetsStore.isCurrentMonthTheLast();
        });
    }
  }

  get current() {
    if (this.currentMonthlyBudget) {
      return this.currentMonthlyBudget();
    }

    return null;
  }

  get currentOutflows() {
    return this.monthlyBudgetsStore.getCurrentOutflows();
  }

  getNextMonth() {
    this.monthlyBudgetsStore.setNextMonth();
  }

  getPreviousMonth() {
    this.monthlyBudgetsStore.setPreviousMonth();
  }
}
