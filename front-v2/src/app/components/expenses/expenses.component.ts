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
  AddBudget,
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
import { ShortDatePipe } from '../../pipes/short-date/short-date.pipe';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DesignSystemModule,
    TransferChoiceComponent,
    ShortDatePipe,
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
  addBudgetFormIsLoading = false;
  isExpensesModalOpen = false;
  isUpdateBudgetModalOpen = false;
  weeks: { id: string; name: string; expensesId: string[] }[] = [];
  filters: string[] = [];
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
  addBudgetModalIsOpen = false;
  isNumpadBudgetModalOpen = false;
  addingBudget: AddBudget | null = null;
  updatingBudget: { id: string; name: string; expensesId: string[] } | null =
    null;

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

  openAddBudgetModal() {
    this.addBudgetModalIsOpen = true;
    this.addingBudget = {
      initialBalance: 0,
      name: '',
    };
  }

  closeAddBudgetModal(event: Event) {
    this.addBudgetModalIsOpen = false;
    this.addingBudget = null;
    event.stopPropagation();
  }

  updateBudgetName(event: Event) {
    if (!this.addingBudget) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.addingBudget.name = value;
  }

  updateUpdatingBudgetName(event: Event) {
    if (!this.updatingBudget) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.updatingBudget.name = value;
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

  filterIsActive(weekId: string) {
    return this.filters.includes(weekId);
  }

  get forecastBalance() {
    return (
      this.month()?.dashboard.weeks.forecastBalance ?? 'ERROR: forecast balance'
    );
  }

  get unfoldBudgetsLabel() {
    return this.budgetsUnfolded ? 'Tout replier' : 'Tout déplier';
  }

  getBudgetsInfos(weekId: string) {
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
      this.filters = this.weeks.map((w) => w.id);
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

  getCurrentBalanceByWeekId(weekId: string) {
    return this.getDashboardWeeklyBudgetById(weekId)?.currentBalance ?? 0;
  }

  getPendingInfo(weekId: string) {
    const budget = this.month()?.account.weeklyBudgets.find(
      (b) => b.id === weekId
    );
    if (budget) {
      return budget.pendingFrom
        ? new Date(budget.pendingFrom)?.toISOString()
        : null;
    }
    return null;
  }

  getInitialBalanceByWeekId(weekId: string) {
    return this.getDashboardWeeklyBudgetById(weekId)?.initialBalance ?? 0;
  }

  private getDashboardWeeklyBudgetById(weekId: string) {
    return this.month()?.dashboard.weeks.weeklyBudgets.find(
      (w) => w.weekId === weekId
    );
  }

  private sortBudgets(
    a: {
      id: string;
      name: string;
      expensesId: string[];
      pendingFrom?: Date | null;
    },
    b: {
      id: string;
      name: string;
      expensesId: string[];
      pendingFrom?: Date | null;
    }
  ) {
    if (!a.pendingFrom && b.pendingFrom) return 1; // a après b
    if (a.pendingFrom && !b.pendingFrom) return -1; // a avant b

    // Deuxième critère : si les deux ont des dates, on les trie par date
    if (a.pendingFrom && b.pendingFrom) {
      return (
        new Date(a.pendingFrom).getTime() - new Date(b.pendingFrom).getTime()
      );
    }

    // Troisième critère : si les deux sont null, ou ont la même date, trie par name
    return a.name.localeCompare(b.name);
  }

  private setForm() {
    const month = this.month();
    if (month) {
      this.weeks = month.account.weeklyBudgets
        .map((w) => {
          return {
            id: w.id,
            name: w.name,
            pendingFrom: w.pendingFrom,
            expensesId: w.expenses.map((e) => e.id),
          };
        })
        .sort(this.sortBudgets);
      this.form = this.fb.group({
        expenses: this.fb.array([]),
      });

      this.expenses()!.forEach((expense) => this.addExpense(expense));
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

  updateFilterState(weekId: string) {
    if (!this.filters.includes(weekId)) {
      this.filters.push(weekId);
    } else {
      this.filters = this.filters.filter((f) => f !== weekId);
    }
  }

  getExpensesFormGroupByWeekId(weekId: string) {
    return this.expensesFormArray.controls.filter((expense) => {
      const expenseWeekId = expense.get('weekId')?.value;
      return expenseWeekId === weekId && this.filters.includes(expenseWeekId);
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

  openUpdateBudgetModal(weekId?: string) {
    this.updatingBudget = this.weeks.find((w) => w.id === weekId) ?? null;
    this.isUpdateBudgetModalOpen = true;
  }

  closeUpdateBudgetModal(event: Event) {
    event.stopPropagation();
    this.updatingBudget = null;
    this.isUpdateBudgetModalOpen = false;
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

  closeBudgetNumpad(event: Event) {
    this.isNumpadBudgetModalOpen = false;
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

  openNumpadBudget(event: Event) {
    this.isNumpadBudgetModalOpen = true;
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

  updateBudgetInitialBalanceValue(value: string) {
    if (this.addingBudget) {
      const initialBalance = Number(value.replace(',', '.'));
      this.addingBudget.initialBalance = initialBalance;
      this.isNumpadBudgetModalOpen = false;
    }
  }

  submitNewBudget(event: Event) {
    event.stopPropagation();
    if (!this.addingBudget) {
      return;
    }

    this.addBudgetFormIsLoading = true;
    this.monthsService
      .addBudget(this.month()!.id, this.addingBudget)
      .pipe(
        finalize(() => {
          this.addBudgetModalIsOpen = false;
          this.addBudgetFormIsLoading = false;
          this.addingBudget = null;
        })
      )
      .subscribe(() => {
        this.toaster.success('Votre budget a bien été crée !');
      });
  }

  submitUpdateBudget(event: Event) {
    event.stopPropagation();
    if (!this.updatingBudget) {
      return;
    }

    this.formIsLoading = true;
    this.monthsService
      .updateBudget(
        this.month()!.id,
        this.updatingBudget.id,
        this.updatingBudget.name
      )
      .pipe(
        finalize(() => {
          this.isUpdateBudgetModalOpen = false;
          this.formIsLoading = false;
          this.updatingBudget = null;
        })
      )
      .subscribe(() => {
        this.toaster.success('Votre budget a bien été modifié !');
      });
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
