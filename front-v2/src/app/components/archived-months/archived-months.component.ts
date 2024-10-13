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
} from '../../stores/monthlyBudgets.store.interface';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { DateNormalizePipe } from '../../pipes/date-normalize.pipe';
import { CommonModule } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs';

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

  constructor(
    private router: Router,
    private injector: Injector,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(HotToastService) private toaster: HotToastService
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

  isUnarchiveMonthLoadingById(monthId: string) {
    return this.unarchiveLoadingByMonthId === monthId;
  }

  backToHome() {
    this.router.navigate(['home']);
  }
}
