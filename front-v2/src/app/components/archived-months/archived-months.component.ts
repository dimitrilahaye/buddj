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

@Component({
  selector: 'app-archived-months',
  standalone: true,
  imports: [DesignSystemModule],
  templateUrl: './archived-months.component.html',
  styleUrl: './archived-months.component.scss',
})
export class ArchivedMonthsComponent implements OnInit {
  archivedMonths: Signal<MonthlyBudget[] | null> = signal(null);
  dataLoaded = false;

  constructor(
    private router: Router,
    private injector: Injector,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface
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

  backToHome() {
    this.router.navigate(['home']);
  }
}
