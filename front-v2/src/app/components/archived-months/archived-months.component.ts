import {
  Component,
  effect,
  Inject,
  Injector,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CommonModule } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';

@Component({
  selector: 'app-archived-months',
  standalone: true,
  imports: [DesignSystemModule, DateNormalizePipe, CommonModule],
  templateUrl: './archived-months.component.html',
  styleUrl: './archived-months.component.scss',
})
export class ArchivedMonthsComponent implements OnInit {
  archivedMonths: Signal<MonthlyBudget[] | null> = signal(null);
  dataLoaded = false;
  unarchiveLoadingByMonthId: string | null = null;
  deleteMonthLoading = false;
  openMenuModal = false;

  constructor(
    private router: Router,
    private injector: Injector,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(TOASTER_SERVICE) private toaster: ToasterServiceInterface
  ) {}

  ngOnInit(): void {
    this.archivedMonths = this.monthlyBudgetsStore.getAllArchivedMonths();
    effect(
      () => {
        if (this.getArchivedMonths()) {
          this.dataLoaded = true;
        }
      },
      { injector: this.injector }
    );
  }

  getArchivedMonths() {
    return this.archivedMonths() ?? [];
  }

  hasArchivedMonths() {
    return this.getArchivedMonths().length > 0;
  }

  getMonthDate(month: MonthlyBudget) {
    return new Date(month.date).toDateString();
  }

  unarchiveMonth(month: MonthlyBudget) {
    this.unarchiveLoadingByMonthId = month.id;
    this.monthsService
      .unarchiveMonth(month.id)
      .pipe(finalize(() => (this.unarchiveLoadingByMonthId = null)))
      .subscribe(() => this.toaster.success('Votre mois a été désarchivé !'));
  }

  toggle(event: Event) {
    this.openMenuModal = !this.openMenuModal;
    event.stopPropagation();
  }

  deleteMonth(month: MonthlyBudget, event: Event) {
    event.stopPropagation();
    this.deleteMonthLoading = true;
    this.monthsService
      .deleteMonth(month.id)
      .pipe(finalize(() => (this.deleteMonthLoading = false)))
      .subscribe(() => this.toaster.success('Votre mois a été supprimé !'));
  }

  isUnarchiveMonthLoadingById(monthId: string) {
    return this.unarchiveLoadingByMonthId === monthId;
  }

  backToHome() {
    this.router.navigate(['home']);
  }
}
