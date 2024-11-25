import {
  Component,
  Inject,
  Input,
  OnInit,
  output,
  signal,
  Signal,
} from '@angular/core';
import { DesignSystemModule } from '../../../design-system/design-system.module';
import {
  Account,
  DashboardWeeklyBudget,
  MonthlyBudget,
  WeeklyBudget,
} from '../../../models/monthlyBudget.model';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { CommonModule, CurrencyPipe } from '@angular/common';

export interface ValidationData {
  data: Account | (DashboardWeeklyBudget & { id: string });
  type: 'Account' | 'WeeklyBudget';
  amount: number;
  information: {
    target: string;
    detail: string;
  };
}

export interface TransferData {
  monthId: string;
  amount: number;
  fromType: 'account' | 'weekly-budget';
  fromId: string;
  toType: 'account' | 'weekly-budget';
  toId: string;
}

@Component({
  selector: 'app-transfer-choice',
  standalone: true,
  imports: [DesignSystemModule, CurrencyPipe, CommonModule],
  providers: [CurrencyPipe],
  templateUrl: './transfer-choice.component.html',
  styleUrl: './transfer-choice.component.scss',
})
export class TransferChoiceComponent implements OnInit {
  @Input()
  openMenuModal = false;
  @Input()
  isLoading = false;
  @Input()
  fromAccount: Account | null = null;
  @Input()
  fromWeeklyBudget: WeeklyBudget | null = null;
  toggleModal = output<Event>();
  submitted = output<TransferData>();

  currentMonth: Signal<MonthlyBudget | null> = signal(null);
  validationData: ValidationData | null = null;
  fromValidationAccount: Account | null = null;
  fromValidationWeeklyBudget: WeeklyBudget | null = null;
  amount = 0;
  numpadIsOpen = false;

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetStore: MonthlyBudgetsStoreInterface,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.currentMonth = this.monthlyBudgetStore.getCurrent();
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.amount = +inputElement.value;
  }

  openNumpad(event: Event): void {
    this.numpadIsOpen = true;
    event.stopPropagation();
  }

  closeNumpad(event: Event) {
    this.numpadIsOpen = false;
    event.stopPropagation();
  }

  updateAmountValue(value: string) {
    this.amount = Number(value.replace(',', '.'));
    this.numpadIsOpen = false;
  }

  get transferAmount() {
    return this.amount;
  }

  get transferSourceLabel() {
    if (this.fromAccount) {
      return 'Solde courant';
    }
    if (this.fromWeeklyBudget) {
      return this.fromWeeklyBudget.name;
    }
    throw new Error('You need to set fromAccount or fromWeeklyBudget Input');
  }

  get buttons(): ValidationData[] {
    if (this.fromAccount) {
      return this.currentMonth()!
        .dashboard.weeks.weeklyBudgets.map((w) => {
          const week = this.currentMonth()?.account.weeklyBudgets.find(
            (week) => week.name === w.weekName
          );
          return {
            data: { ...w, id: week!.id },
            type: 'WeeklyBudget',
            amount: this.amount,
            information: this.getWeekTransferInformation(w),
          };
        })
        .sort((a, b) =>
          a.data.weekName.localeCompare(b.data.weekName)
        ) as ValidationData[];
    }
    if (this.fromWeeklyBudget) {
      const otherWeeklyBudgets = this.currentMonth()!
        .dashboard.weeks.weeklyBudgets.filter(
          (w) => w.weekName !== this.fromWeeklyBudget?.name
        )
        .map((w) => {
          const week = this.currentMonth()?.account.weeklyBudgets.find(
            (week) => week.name === w.weekName
          );
          return {
            data: { ...w, id: week!.id },
            type: 'WeeklyBudget',
            amount: this.amount,
            information: this.getWeekTransferInformation(w),
          };
        })
        .sort((a, b) => a.data.weekName.localeCompare(b.data.weekName));
      return [
        ...(otherWeeklyBudgets as ValidationData[]),
        {
          data: this.currentMonth()!.account,
          type: 'Account',
          amount: this.amount,
          information: this.getAccountTransfertInformation(
            this.currentMonth()!.account
          ),
        },
      ];
    }
    throw new Error('You need to set fromAccount or fromWeeklyBudget Input');
  }

  private getWeekTransferInformation(weeklyBudget: DashboardWeeklyBudget) {
    return {
      target: weeklyBudget.weekName,
      detail: `(${this.currencyPipe.transform(
        weeklyBudget.currentBalance,
        'EUR'
      )} » ${this.currencyPipe.transform(
        weeklyBudget.currentBalance + this.transferAmount!,
        'EUR'
      )})`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getAccountTransfertInformation(_account: Account) {
    const forecastBalance =
      this.currentMonth()!.dashboard.account.forecastBalance;
    return {
      target: `Solde courant`,
      detail: `(${this.currencyPipe.transform(
        forecastBalance,
        'EUR'
      )} » ${this.currencyPipe.transform(
        forecastBalance + this.transferAmount!,
        'EUR'
      )})`,
    };
  }

  submitTransfert(button: ValidationData, event: Event) {
    this.amount = 0;
    this.validationData = button;
    if (this.fromAccount) {
      this.fromValidationAccount = this.fromAccount;
    }
    if (this.fromWeeklyBudget) {
      this.fromValidationWeeklyBudget = this.fromWeeklyBudget;
    }

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
    this.submitted.emit(data as TransferData);
    event.stopPropagation();
  }

  toggle(event: Event) {
    this.amount = 0;
    this.toggleModal.emit(event);
    event.stopPropagation();
  }
}
