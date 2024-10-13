/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  Component,
  effect,
  Inject,
  Injector,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { MonthlyBudget, Expense } from '../../models/monthlyBudget.model';
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
} from '../../stores/monthlyBudgets.store.interface';
import { finalize } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';

type FilterState = 'all' | 'checked' | 'unchecked';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DesignSystemModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements AfterViewInit {
  month: Signal<MonthlyBudget | null> = signal(null);
  expenses: Signal<Expense[] | null> = signal(null);

  form!: FormGroup;
  addExpenseForm: FormGroup | null = null;
  expenseDeletionIsLoadingIndex: WritableSignal<string | null> = signal(null);
  formIsLoading = false;
  addExpenseFormIsLoading = false;
  isExpensesModalOpen = false;
  weeks: { id: string; name: string; expensesId: string[] }[] = [];
  filtersState: FilterState = 'all';
  formUpdated = false;

  constructor(
    private fb: FormBuilder,
    private injector: Injector,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface,
    @Inject(HotToastService) private toaster: HotToastService
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
          this.monthlyBudgetsStore.askedForNewExpense();
        if (timesNewExpenseHasBeenAsked > 0) {
          this.openExpensesModal();
          this.monthlyBudgetsStore.resetAskForNewExpense();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );
  }

  filterIsActive(state: FilterState) {
    return this.filtersState === state;
  }

  get forecastBalance() {
    return (
      this.month()?.dashboard.weeks.forecastBalance ?? 'ERROR: forecast balance'
    );
  }

  getCurrentBalanceByWeekName(weekName: string) {
    return (
      this.month()?.dashboard.weeks.weeklyBudgets.find(
        (w) => w.weekName === weekName
      )?.currentBalance ?? 0
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

  updateFilterState(state: FilterState) {
    this.filtersState = state;
  }

  getExpensesFormGroupByWeekId(weekId: string) {
    return this.expensesFormArray.controls
      .filter((control) => control.get('weekId')?.value === weekId)
      .filter((control) => {
        switch (this.filtersState) {
          case 'checked':
            return control.get('isChecked')?.value === true;
          case 'unchecked':
            return control.get('isChecked')?.value === false;
          default:
            return control;
        }
      });
  }

  setAddExpenseForm() {
    this.addExpenseForm = this.fb.group({
      weekId: ['', Validators.required],
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

  deleteExpense(expense: AbstractControl<Expense>, event: Event) {
    this.expenseDeletionIsLoadingIndex.update(
      () => expense.get('id')?.value as string
    );
    const expenseValue = this.getExpenseControl(expense)?.getRawValue();
    if (expenseValue) {
      const { weekId, id: expenseId } = expenseValue;

      this.monthsService
        .deleteExpense(this.month()!.id, weekId, expenseId)
        .pipe(finalize(() => this.stopDeletationLoading()))
        .subscribe(() =>
          this.toaster.success('Votre dépense a été supprimée !')
        );
    }
    event.stopPropagation();
  }

  expenseDeletionIsLoadingByIndex(expense: AbstractControl<Expense>) {
    return this.expenseDeletionIsLoadingIndex() === expense.get('id')?.value;
  }

  stopDeletationLoading() {
    this.expenseDeletionIsLoadingIndex.update(() => null);
  }

  openExpensesModal() {
    this.isExpensesModalOpen = true;
    this.setAddExpenseForm();
  }

  closeExpensesModal() {
    this.isExpensesModalOpen = false;
  }

  submitExpenseModal(event: Event) {
    event.preventDefault();
    if (this.addExpenseForm && this.addExpenseForm!.valid) {
      const { weekId, ...data } = this.addExpenseForm.getRawValue();
      this.addExpenseFormIsLoading = true;
      this.monthsService
        .addExpense(this.month()!.id, weekId, data)
        .pipe(finalize(() => (this.addExpenseFormIsLoading = false)))
        .subscribe(() => {
          this.closeExpensesModal();
          this.toaster.success('Votre dépense a été ajoutée !');
        });
    } else {
      this.addExpenseForm!.markAllAsTouched();
    }
    event.stopPropagation();
  }

  // deleteExpense(event: Event) {
  //   this.expensesFormArray.removeAt(this.expenses.length - 1);
  //   this.closeExpensesModal();
  //   event.stopPropagation();
  // }

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
      .pipe(finalize(() => (this.formIsLoading = false)))
      .subscribe(() =>
        this.toaster.success('Vos dépenses ont été modifiées !')
      );
  }
}
