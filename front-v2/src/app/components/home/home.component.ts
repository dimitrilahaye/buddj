import { Component, Inject, signal, Signal } from '@angular/core';
import {
  MONTHLY_BUDGETS_STORE,
  type MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CommonModule, CurrencyPipe } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { finalize } from 'rxjs';
import { DesignSystemModule } from '../../design-system/design-system.module';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    DateNormalizePipe,
    CurrencyPipe,
    DesignSystemModule,
    RouterLink,
    RouterLinkActive,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  currentMonthlyBudget: Signal<MonthlyBudget | null>;
  isCurrentMonthTheFirst: Signal<boolean> = signal(true);
  isCurrentMonthTheLast: Signal<boolean> = signal(false);
  displayLoader = false;
  openMenuModal = false;
  archiveLoading = false;
  confirmArchiveModalIsOpen = false;

  constructor(
    private router: Router,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface
  ) {
    const allMonths = this.monthlyBudgetsStore.getAll();
    if (!allMonths().length) {
      this.getUnarchivedMonths();
    }

    this.currentMonthlyBudget = this.monthlyBudgetsStore.getCurrent();
    this.isCurrentMonthTheFirst =
      this.monthlyBudgetsStore.isCurrentMonthTheFirst();
    this.isCurrentMonthTheLast =
      this.monthlyBudgetsStore.isCurrentMonthTheLast();
  }

  getUnarchivedMonths() {
    this.displayLoader = true;
    this.monthsService
      .getUnarchivedMonths()
      .pipe(
        finalize(() => {
          this.displayLoader = false;
        })
      )
      .subscribe();
  }

  doNothing(event: Event) {
    event.stopPropagation();
  }

  get current() {
    return this.currentMonthlyBudget();
  }

  getNextMonth() {
    this.monthlyBudgetsStore.setNextMonth();
  }

  getPreviousMonth() {
    this.monthlyBudgetsStore.setPreviousMonth();
  }

  goToSettings() {
    this.router.navigate(['settings']);
  }
}
