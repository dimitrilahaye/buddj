import { Component, Inject, Signal } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MenuFooterComponent,
    DateNormalizePipe,
    CurrencyPipe,
    DesignSystemModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  monthlyBudgets: Signal<MonthlyBudget[]> | null = null;
  displayLoader = false;

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface
  ) {
    if (!this.currentMonth) {
      this.displayLoader = true;
      this.monthsService
        .getUnarchivedMonths()
        .pipe(
          finalize(() => {
            this.displayLoader = false;
          })
        )
        .subscribe(() => {
          this.monthlyBudgets = this.monthlyBudgetsStore.getAll();
        });
    }
  }

  get currentMonth() {
    if (!this.monthlyBudgets || !this.monthlyBudgets()[0]) {
      return null;
    }

    return this.monthlyBudgets()[0];
  }
}
