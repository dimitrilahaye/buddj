import { Component, Inject, Signal } from '@angular/core';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { Router } from '@angular/router';
import {
  AUTHENTICATION_SERVICE,
  AuthenticationServiceInterface,
} from '../../services/authentication/authentication.service.interface';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { finalize } from 'rxjs';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DateNormalizePipe, DesignSystemModule, HeaderBackButtonComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  displayLoader = false;
  archiveLoading = false;
  confirmArchiveModalIsOpen = false;
  currentMonthlyBudget: Signal<MonthlyBudget | null>;

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

  get current() {
    return this.currentMonthlyBudget();
  }

  get currentMonthDate() {
    if (!this.current) {
      return '';
    }
    return new Date(this.current!.date).toDateString();
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

  navigateToArchivedMonths(event: Event) {
    event.stopPropagation();
    this.router.navigate(['archived-months']);
  }

  navigateToMonthlyTemplates(event: Event) {
    event.stopPropagation();
    this.router.navigate(['monthly-templates']);
  }

  navigateToYearlyOutlfows(event: Event) {
    event.stopPropagation();
    this.router.navigate(['yearly-outflows']);
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

  toggleArchiveCurrentMonthModal(event: Event) {
    this.confirmArchiveModalIsOpen = !this.confirmArchiveModalIsOpen;
    event.stopPropagation();
  }
}
