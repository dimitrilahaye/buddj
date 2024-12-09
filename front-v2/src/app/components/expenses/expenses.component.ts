/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  Component,
  effect,
  Inject,
  Injector,
  signal,
  Signal,
} from '@angular/core';
import { DesignSystemModule } from '../../design-system/design-system.module';
import {
  MonthlyBudget,
  Expense,
  Account,
  WeeklyBudget,
} from '../../models/monthlyBudget.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { amountValidator } from '../../validators/amount.validator';
import { CommonModule } from '@angular/common';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { finalize } from 'rxjs';
import { TransferChoiceComponent } from '../transfer-modals/transfer-choice/transfer-choice.component';
import { TransferData } from '../transfer-modals/transfer-choice/transfer-choice.component';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DesignSystemModule,
    TransferChoiceComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements AfterViewInit {
  month: Signal<MonthlyBudget | null> = signal(null);
  expenses: Signal<Expense[] | null> = signal(null);

  form!: FormGroup;
  addExpenseForm: FormGroup | null = null;
  formIsLoading = false;
  addExpenseFormIsLoading = false;
  isExpensesModalOpen = false;
  weeks: { id: string; name: string; expensesId: string[] }[] = [];
  filters: number[] = [1, 2, 3, 4, 5];
  formUpdated = false;
  expenseDelationModalIsOpen = false;
  deleteExpenseFormIsLoading = false;
  expenseToDelete: (Expense & { weekId: string }) | null = null;
  isNumpadModalOpen = false;
  amountValueControl: AbstractControl<any, any> | null = null;

  transferChoiceModalIsOpen = false;
  fromAccountTransfer: Account | null = null;
  fromWeeklyBudgetTransfer: WeeklyBudget | null = null;
  transferIsLoading = false;

  budgetsUnfolded = false;

  constructor(
    private fb: FormBuilder,
    private injector: Injector,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(TOASTER_SERVICE) private toaster: ToasterServiceInterface
  ) {}

  ngAfterViewInit(): void {
    this.month = this.monthlyBudgetsStore.getCurrent();
    this.expenses = this.monthlyBudgetsStore.getCurrentExpenses();
    effect(
      () => {
        if (this.month()) {
          this.setForm();

          this.form.valueChanges.subscribe(() => {
            if (this.formUpdated === false) {
              this.formUpdated = true;
            }
          });
        }
      },
      { injector: this.injector }
    );

    effect(
      () => {
        const timesNewExpenseHasBeenAsked =
          this.monthlyBudgetsStore.askedForNewExpense;
        if (timesNewExpenseHasBeenAsked() > 0) {
          this.openExpensesModal();
          this.monthlyBudgetsStore.resetAskForNewExpense();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );
  }

  closeTransferChoiceModal(event: Event) {
    this.transferChoiceModalIsOpen = false;
    event.stopPropagation();
  }

  openTransferChoiceModal(week: any, event: Event) {
    this.fromWeeklyBudgetTransfer =
      this.month()?.account.weeklyBudgets.find((w) => w.id === week.id) ?? null;
    this.transferChoiceModalIsOpen = true;
    event.stopPropagation();
  }

  filterIsActive(week: number) {
    return this.filters.includes(week);
  }

  get forecastBalance() {
    return (
      this.month()?.dashboard.weeks.forecastBalance ?? 'ERROR: forecast balance'
    );
  }

  get unfoldBudgetsLabel() {
    return this.budgetsUnfolded ? 'Tout replier' : 'Tout déplier';
  }

  geBudgetsInfos(weekId: string) {
    const expensesForWeekId = this.getExpensesByWeekId(weekId);
    const totalExpenses = expensesForWeekId.length;
    const checkedExpenses = expensesForWeekId.filter(
      (e) => !e.isChecked
    ).length;
    return `${checkedExpenses} non-prélevées / ${totalExpenses}`;
  }

  toggleBudgetsUnfolded() {
    this.budgetsUnfolded = !this.budgetsUnfolded;
    if (this.budgetsUnfolded) {
      this.filters = [1, 2, 3, 4, 5];
    } else {
      this.filters = [];
    }
  }

  openExpenseDelationModal(expense: AbstractControl<Expense>, event: Event) {
    this.expenseDelationModalIsOpen = true;
    this.expenseToDelete = expense.getRawValue();
    event.stopPropagation();
  }

  closeExpenseDelationModal(event: Event) {
    this.expenseDelationModalIsOpen = false;
    this.expenseToDelete = null;
    event.stopPropagation();
  }

  getCurrentBalanceByWeekName(weekName: string) {
    return this.getDashboardWeeklyBudgetByName(weekName)?.currentBalance ?? 0;
  }

  getInitialBalanceByWeekName(weekName: string) {
    return this.getDashboardWeeklyBudgetByName(weekName)?.initialBalance ?? 0;
  }

  private getDashboardWeeklyBudgetByName(weekName: string) {
    return this.month()?.dashboard.weeks.weeklyBudgets.find(
      (w) => w.weekName === weekName
    );
  }

  private setForm() {
    const month = this.month();
    if (month) {
      this.weeks = month.account.weeklyBudgets
        .map((w) => {
          return {
            id: w.id,
            name: w.name,
            expensesId: w.expenses.map((e) => e.id),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      this.form = this.fb.group({
        expenses: this.fb.array([]),
      });

      this.expenses()!.forEach((expense) => this.addExpense(expense));

      this.filters = [];
    }
  }

  addExpense(expense: Expense) {
    const expenseWeek = this.weeks.find((w) =>
      w.expensesId.includes(expense.id)
    );
    if (expenseWeek) {
      const expenseGroup = this.fb.group({
        weekId: [expenseWeek.id],
        weekName: [expenseWeek.name],
        id: [{ value: expense.id, disabled: true }], // hidden
        label: [expense.label, Validators.required],
        amount: [expense.amount, [Validators.required, amountValidator()]],
        isChecked: [{ value: expense.isChecked, disabled: true }], // hidden
      });
      this.expensesFormArray.push(expenseGroup);
    }
  }

  updateFilterState(week: number) {
    if (this.filters.includes(week)) {
      this.filters = this.filters.filter((f) => f !== week);
    } else {
      this.filters.push(week);
    }
  }

  getExpensesFormGroupByWeekId(weekId: string) {
    return this.expensesFormArray.controls.filter((expense) => {
      const expenseWeekId = expense.get('weekId')?.value;
      const weekNumber = this.weeks.findIndex((w) => w.id === weekId);
      if (this.filters.length === 0) {
        return false;
      }
      return expenseWeekId === weekId && this.filters.includes(weekNumber + 1);
    });
  }

  getExpensesByWeekId(weekId: string) {
    const budget = this.month()!.account.weeklyBudgets.find(
      (w) => w.id === weekId
    );
    if (budget) {
      return budget.expenses;
    }
    return [];
  }

  setAddExpenseForm(weekId?: string) {
    this.addExpenseForm = this.fb.group({
      weekId: [weekId ?? '', Validators.required],
      label: [null, Validators.required],
      amount: [0, [Validators.required, amountValidator()]],
    });
  }

  get expensesFormArray(): FormArray {
    return this.form.get('expenses') as FormArray;
  }

  toggleExpenseAtIndex(expense: AbstractControl<Expense>, event: Event) {
    const expenseControl = this.getExpenseControl(expense);
    const expenseValue = expenseControl?.getRawValue();
    expenseControl?.setValue({
      ...expenseValue,
      isChecked: !expenseValue.isChecked,
    });
    event.stopPropagation();
  }

  isExpenseItemChecked(expense: AbstractControl<Expense>) {
    const expenseValue = this.getExpenseControl(expense);
    return expenseValue?.getRawValue().isChecked;
  }

  private getExpenseControl(expense: AbstractControl<Expense, Expense>) {
    return this.expensesFormArray.controls.find(
      (control) => control.get('id')?.value === expense.get('id')?.value
    );
  }

  deleteExpense(event: Event) {
    this.deleteExpenseFormIsLoading = true;
    if (this.expenseToDelete) {
      const { weekId, id: expenseId } = this.expenseToDelete;

      this.monthsService
        .deleteExpense(this.month()!.id, weekId, expenseId)
        .pipe(
          finalize(() => {
            this.deleteExpenseFormIsLoading = false;
            this.closeExpenseDelationModal(event);
          })
        )
        .subscribe(() =>
          this.toaster.success('Votre dépense a été supprimée !')
        );
    }
    event.stopPropagation();
  }

  openExpensesModal(weekId?: string) {
    this.isExpensesModalOpen = true;
    this.setAddExpenseForm(weekId);
  }

  closeExpensesModal(event: Event) {
    this.isExpensesModalOpen = false;
    event.stopPropagation();
  }

  submitExpenseModal(event: Event) {
    event.preventDefault();
    if (this.addExpenseForm && this.addExpenseForm!.valid) {
      const { weekId, ...data } = this.addExpenseForm.getRawValue();
      this.addExpenseFormIsLoading = true;
      this.monthsService
        .addExpense(this.month()!.id, weekId, data)
        .pipe(
          finalize(() => {
            this.addExpenseFormIsLoading = false;
          })
        )
        .subscribe(() => {
          this.closeExpensesModal(event);
          this.toaster.success('Votre dépense a été ajoutée !');
        });
    } else {
      this.addExpenseForm!.markAllAsTouched();
    }
    event.stopPropagation();
  }

  closeNumpad(event: Event) {
    this.isNumpadModalOpen = false;
    event.stopPropagation();
  }

  openNumpad(control: AbstractControl, event: Event) {
    this.amountValueControl = control;
    this.isNumpadModalOpen = true;
    event.stopPropagation();
  }

  get amountValue() {
    return '' + this.amountValueControl?.value;
  }

  updateAmountValue(value: string) {
    this.amountValueControl?.patchValue(Number(value.replace(',', '.')));
    this.isNumpadModalOpen = false;
    this.amountValueControl = null;
  }

  onSubmit() {
    this.formIsLoading = true;
    const formValue = this.form.getRawValue();
    const data = {
      weeklyBudgets: this.weeks.map((w) => ({
        id: w.id,
        expenses: formValue.expenses
          .filter((e: any) => e.weekId === w.id)
          .map((e: any) => ({
            id: e.id,
            isChecked: e.isChecked,
          })),
      })),
    };
    this.monthsService
      .updateExpensesChecking(this.month()!.id, data)
      .pipe(
        finalize(() => {
          this.formIsLoading = false;
        })
      )
      .subscribe(() => {
        this.toaster.success('Vos dépenses ont été modifiées !');
        this.formUpdated = false;
      });
  }

  submitTransfer(data: TransferData) {
    const { monthId, amount, fromType, fromId, toType, toId } = data;
    this.transferIsLoading = true;
    this.monthsService
      .transferRemainingBalanceIntoMonth(
        monthId,
        amount,
        fromType,
        fromId,
        toType,
        toId
      )
      .pipe(
        finalize(() => {
          this.transferIsLoading = false;
          this.transferChoiceModalIsOpen = false;
        })
      )
      .subscribe(() => {
        this.toaster.success("Votre transfert s'est bien déroulé !");
      });
  }
}
