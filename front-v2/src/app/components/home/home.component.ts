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
import {
  AUTHENTICATION_SERVICE,
  AuthenticationServiceInterface,
} from '../../services/authentication/authentication.service.interface';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster.service.interface';

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
  confirmArchiveModalIsOpen = false;

  constructor(
    private router: Router,
    @Inject(TOASTER_SERVICE) private toaster: ToasterServiceInterface,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(AUTHENTICATION_SERVICE)
    private authenticationService: AuthenticationServiceInterface
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

  toggleMenuModal(event: Event) {
    setTimeout(() => {
      this.openMenuModal = !this.openMenuModal;
    }, 0);
    event.stopPropagation();
  }

  navigateToExpenses(event: Event) {
    this.monthlyBudgetsStore.askForNewExpense();
    this.router.navigate(['/home', 'expenses']);
    this.toggleMenuModal(event);
    event.stopPropagation();
  }

  navigateToOutflows(event: Event) {
    this.monthlyBudgetsStore.askForNewOutflow();
    this.router.navigate(['/home', 'outflows']);
    this.toggleMenuModal(event);
    event.stopPropagation();
  }

  navigateToMonthCreation() {
    this.monthlyBudgetsStore.resetAskForNewOutflow();
    this.monthlyBudgetsStore.resetAskForNewExpense();
    this.router.navigate(['month-creation']);
  }

  toggleArchiveCurrentMonthModal(event: Event) {
    this.confirmArchiveModalIsOpen = !this.confirmArchiveModalIsOpen;
    if (this.confirmArchiveModalIsOpen) {
      this.toggleMenuModal(event);
    }
    event.stopPropagation();
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

  logout(event: Event) {
    event.stopPropagation();
    this.authenticationService
      .logout()
      .pipe(
        finalize(() => {
          this.toaster.success('Vous avez été déconnectés !');
          this.router.navigate(['login']);
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
