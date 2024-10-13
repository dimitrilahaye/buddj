import { Component, Inject, signal, Signal } from '@angular/core';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CurrencyPipe, NgClass } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { finalize } from 'rxjs';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { OutflowsComponent } from '../outflows/outflows.component';
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
    OutflowsComponent,
    RouterLink,
    RouterLinkActive,
    NgClass,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  currentMonthlyBudget: Signal<MonthlyBudget | null> | null = null;
  isCurrentMonthTheFirst: Signal<boolean> = signal(true);
  isCurrentMonthTheLast: Signal<boolean> = signal(false);
  displayLoader = false;
  plusOpen = false;

  constructor(
    private router: Router,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface
  ) {
    const allMonths = this.monthlyBudgetsStore.getAll();
    if (!allMonths().length) {
      this.displayLoader = true;
      this.monthsService
        .getUnarchivedMonths()
        .pipe(
          finalize(() => {
            this.displayLoader = false;
          })
        )
        .subscribe(() => {
          this.initializeCurrentMonth();
        });
    } else {
      this.initializeCurrentMonth();
    }
  }

  toggle() {
    this.plusOpen = !this.plusOpen;
  }

  navigateToExpenses(event: Event) {
    this.monthlyBudgetsStore.askForNewExpense();
    this.router.navigate(['/home', 'expenses']);
    this.toggle();
    event.stopPropagation();
  }

  navigateToOutflows(event: Event) {
    this.monthlyBudgetsStore.askForNewOutflow();
    this.router.navigate(['/home', 'outflows']);
    this.toggle();
    event.stopPropagation();
  }

  navigateToMonthCreation() {
    this.monthlyBudgetsStore.resetAskForNewOutflow();
    this.monthlyBudgetsStore.resetAskForNewExpense();
    this.router.navigate(['month-creation']);
  }

  private initializeCurrentMonth() {
    this.currentMonthlyBudget = this.monthlyBudgetsStore.getCurrent();
    this.isCurrentMonthTheFirst =
      this.monthlyBudgetsStore.isCurrentMonthTheFirst();
    this.isCurrentMonthTheLast =
      this.monthlyBudgetsStore.isCurrentMonthTheLast();
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
