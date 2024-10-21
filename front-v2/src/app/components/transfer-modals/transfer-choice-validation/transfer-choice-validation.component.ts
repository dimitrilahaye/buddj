import {
  Component,
  Inject,
  Input,
  OnInit,
  output,
  Signal,
  signal,
} from '@angular/core';
import { DesignSystemModule } from '../../../design-system/design-system.module';
import { CommonModule } from '@angular/common';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../../stores/monthlyBudgets.store.interface';
import {
  Account,
  DashboardWeeklyBudget,
  MonthlyBudget,
  WeeklyBudget,
} from '../../../models/monthlyBudget.model';

@Component({
  selector: 'app-transfer-choice-validation',
  standalone: true,
  imports: [DesignSystemModule, CommonModule],
  providers: [],
  templateUrl: './transfer-choice-validation.component.html',
  styleUrl: './transfer-choice-validation.component.scss',
})
export class TransferChoiceValidationComponent implements OnInit {
  @Input()
  openMenuModal = false;
  @Input()
  validationData: {
    data: Account | (DashboardWeeklyBudget & { id: string });
    type: 'Account' | 'WeeklyBudget';
    information: string;
  } | null = null;
  @Input()
  fromValidationAccount: Account | null = null;
  @Input()
  fromValidationWeeklyBudget: WeeklyBudget | null = null;
  toggleModal = output<Event>();
  submitted = output<{
    monthId: string;
    fromType: 'account' | 'weekly-budget';
    fromId: string;
    toType: 'account' | 'weekly-budget';
    toId: string;
  }>();

  currentMonth: Signal<MonthlyBudget | null> = signal(null);

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetStore: MonthlyBudgetsStoreInterface
  ) {}

  ngOnInit(): void {
    this.currentMonth = this.monthlyBudgetStore.getCurrent();
  }

  get transferSourceLabel() {
    if (this.fromValidationAccount) {
      return 'Solde courant';
    }
    if (this.fromValidationWeeklyBudget) {
      return this.fromValidationWeeklyBudget.name;
    }
    throw new Error(
      'You need to set fromValidationAccount or fromValidationWeeklyBudget Input'
    );
  }

  toggle(event: Event) {
    this.toggleModal.emit(event);
    event.stopPropagation();
  }

  submit(event: Event) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      monthId: this.currentMonth()?.id,
    };
    if (this.fromValidationAccount) {
      data['fromType'] = 'account';
      data['fromId'] = this.fromValidationAccount.id;
    }
    if (this.fromValidationWeeklyBudget) {
      data['fromType'] = 'weekly-budget';
      data['fromId'] = this.fromValidationWeeklyBudget.id;
    }
    if (this.validationData?.type === 'Account') {
      data['toType'] = 'account';
      data['toId'] = this.validationData.data.id;
    }
    if (this.validationData?.type === 'WeeklyBudget') {
      data['toType'] = 'weekly-budget';
      data['toId'] = this.validationData.data.id;
    }
    this.submitted.emit(data);
    event.stopPropagation();
  }
}
