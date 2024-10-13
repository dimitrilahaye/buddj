import { Component, Inject, signal, Signal } from '@angular/core';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
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
import { HotToastService } from '@ngxpert/hot-toast';

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
    NgClass,
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

  constructor(
    private router: Router,
    @Inject(HotToastService) private toaster: HotToastService,
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
        .subscribe();
    }

    this.currentMonthlyBudget = this.monthlyBudgetsStore.getCurrent();
    this.isCurrentMonthTheFirst =
      this.monthlyBudgetsStore.isCurrentMonthTheFirst();
    this.isCurrentMonthTheLast =
      this.monthlyBudgetsStore.isCurrentMonthTheLast();
  }

  toggle(event: Event) {
    setTimeout(() => {
      this.openMenuModal = !this.openMenuModal;
    }, 0);
    event.stopPropagation();
  }

  navigateToExpenses(event: Event) {
    this.monthlyBudgetsStore.askForNewExpense();
    this.router.navigate(['/home', 'expenses']);
    event.stopPropagation();
  }

  navigateToOutflows(event: Event) {
    this.monthlyBudgetsStore.askForNewOutflow();
    this.router.navigate(['/home', 'outflows']);
    event.stopPropagation();
  }

  navigateToMonthCreation() {
    this.monthlyBudgetsStore.resetAskForNewOutflow();
    this.monthlyBudgetsStore.resetAskForNewExpense();
    this.router.navigate(['month-creation']);
  }

  archiveCurrentMonth(event: Event) {
    this.archiveLoading = true;
    this.monthsService
      .archiveMonth(this.currentMonthlyBudget()!.id)
      .pipe(finalize(() => (this.archiveLoading = false)))
      .subscribe(() => {
        this.toaster.success('Votre mois a été archivé !');
        this.router.navigate(['archived-months']);
      });
    event.stopPropagation();
  }

  navigateToArchivedMonths(event: Event) {
    event.stopPropagation();
    this.router.navigate(['archived-months']);
  }

  doNothing(event: Event) {
    event.stopPropagation();
  }

  get current() {
    return this.currentMonthlyBudget();
  }

  get currentMonthDate() {
    return new Date(this.current!.date).toDateString();
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
