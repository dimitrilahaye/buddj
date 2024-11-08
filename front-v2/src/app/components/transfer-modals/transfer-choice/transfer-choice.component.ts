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
} from '../../../stores/monthlyBudgets.store.interface';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TransferChoiceValidationComponent } from '../transfer-choice-validation/transfer-choice-validation.component';

export interface ValidationData {
  data: Account | (DashboardWeeklyBudget & { id: string });
  type: 'Account' | 'WeeklyBudget';
  information: {
    target: string;
    detail: string;
  };
}

@Component({
  selector: 'app-transfer-choice',
  standalone: true,
  imports: [
    DesignSystemModule,
    CurrencyPipe,
    CommonModule,
    TransferChoiceValidationComponent,
  ],
  providers: [CurrencyPipe],
  templateUrl: './transfer-choice.component.html',
  styleUrl: './transfer-choice.component.scss',
})
export class TransferChoiceComponent implements OnInit {
  @Input()
  openMenuModal = false;
  @Input()
  fromAccount: Account | null = null;
  @Input()
  fromWeeklyBudget: WeeklyBudget | null = null;
  toggleModal = output<Event>();
  submitted = output<{
    monthId: string;
    fromType: 'account' | 'weekly-budget';
    fromId: string;
    toType: 'account' | 'weekly-budget';
    toId: string;
  }>();

  transferChoiceModalIsOpen = false;
  currentMonth: Signal<MonthlyBudget | null> = signal(null);
  validationData: ValidationData | null = null;
  fromValidationAccount: Account | null = null;
  fromValidationWeeklyBudget: WeeklyBudget | null = null;

  constructor(
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetStore: MonthlyBudgetsStoreInterface,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.currentMonth = this.monthlyBudgetStore.getCurrent();
  }

  get transferAmount() {
    if (this.fromAccount) {
      return this.fromAccount.currentBalance;
    }
    if (this.fromWeeklyBudget) {
      const fromWeeklyBudget =
        this.currentMonth()!.dashboard.weeks.weeklyBudgets.find(
          (w) => w.weekName === this.fromWeeklyBudget!.name
        );
      return fromWeeklyBudget?.currentBalance;
    }
    throw new Error('You need to set fromAccount or fromWeeklyBudget Input');
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
      return this.currentMonth()!.dashboard.weeks.weeklyBudgets.map((w) => {
        const week = this.currentMonth()?.account.weeklyBudgets.find(
          (week) => week.name === w.weekName
        );
        return {
          data: { ...w, id: week!.id },
          type: 'Account',
          information: this.getWeekTransferInformation(w),
        };
      });
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
            information: this.getWeekTransferInformation(w),
          };
        })
        .sort((a, b) => a.data.weekName.localeCompare(b.data.weekName));
      return [
        ...(otherWeeklyBudgets as ValidationData[]),
        {
          data: this.currentMonth()!.account,
          type: 'Account',
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

  private getAccountTransfertInformation(account: Account) {
    return {
      target: `Solde courant`,
      detail: `(${this.currencyPipe.transform(
        account.currentBalance,
        'EUR'
      )} » ${this.currencyPipe.transform(
        account.currentBalance + this.transferAmount!,
        'EUR'
      )})`,
    };
  }

  closeTransferChoiceModal(event: Event) {
    this.transferChoiceModalIsOpen = false;
    event.stopPropagation();
  }

  openTransferChoiceModal(button: ValidationData, event: Event) {
    this.transferChoiceModalIsOpen = true;
    this.validationData = button;
    if (this.fromAccount) {
      this.fromValidationAccount = this.fromAccount;
    }
    if (this.fromWeeklyBudget) {
      this.fromValidationWeeklyBudget = this.fromWeeklyBudget;
    }
    this.toggle(event);
  }

  toggle(event: Event) {
    this.toggleModal.emit(event);
    event.stopPropagation();
  }

  submitTransfert(data: {
    monthId: string;
    fromType: 'account' | 'weekly-budget';
    fromId: string;
    toType: 'account' | 'weekly-budget';
    toId: string;
  }) {
    this.submitted.emit(data);
  }
}
