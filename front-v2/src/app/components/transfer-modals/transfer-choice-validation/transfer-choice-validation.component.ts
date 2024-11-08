import {
  Component,
  effect,
  Inject,
  Injector,
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
  MonthlyBudget,
  WeeklyBudget,
} from '../../../models/monthlyBudget.model';
import { ValidationData } from '../transfer-choice/transfer-choice.component';

export interface TransferData {
  monthId: string;
  amount: number;
  fromType: 'account' | 'weekly-budget';
  fromId: string;
  toType: 'account' | 'weekly-budget';
  toId: string;
}

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
  isLoading = false;
  @Input()
  validationData: ValidationData | null = null;
  @Input()
  fromValidationAccount: Account | null = null;
  @Input()
  fromValidationWeeklyBudget: WeeklyBudget | null = null;
  toggleModal = output<Event>();
  submitted = output<TransferData>();

  currentMonth: Signal<MonthlyBudget | null> = signal(null);

  constructor(
    private injector: Injector,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetStore: MonthlyBudgetsStoreInterface
  ) {}

  ngOnInit(): void {
    this.currentMonth = this.monthlyBudgetStore.getCurrent();

    effect(
      () => {
        const timesNewExpenseHasBeenAsked =
          this.monthlyBudgetStore.askedForTransferModalClose();
        if (timesNewExpenseHasBeenAsked > 0) {
          this.openMenuModal = false;
          this.monthlyBudgetStore.resetAskForTransferModalClose();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );
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
    const data: Partial<TransferData> = {
      monthId: this.currentMonth()?.id,
      amount: this.validationData?.amount,
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
    this.openMenuModal = false;
    this.submitted.emit(data as TransferData);
    event.stopPropagation();
  }
}
