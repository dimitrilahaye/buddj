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
  expenseDeletionIsLoadingIndex: WritableSignal<number | null> = signal(null);
  formIsLoading = false;
  addExpenseFormIsLoading = false;
  isExpensesModalOpen = false;
  weeks: { id: string; name: string; expensesId: string[] }[] = [];

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
        }
      },
      { injector: this.injector }
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
    const expenseWeekId = this.weeks.find((w) =>
      w.expensesId.includes(expense.id)
    )?.id;
    const expenseGroup = this.fb.group({
      weekId: [expenseWeekId],
      id: [{ value: expense.id, disabled: true }], // hidden
      label: [expense.label, Validators.required],
      amount: [expense.amount, [Validators.required, amountValidator()]],
      isChecked: [{ value: expense.isChecked, disabled: true }], // hidden
    });
    this.expensesFormArray.push(expenseGroup);
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

  toggleExpenseAtIndex(i: number, event: Event) {
    const expenseControl = this.expensesFormArray.at(i);
    const expenseValue = this.expensesFormArray.at(i).getRawValue();
    expenseControl.setValue({
      ...expenseValue,
      isChecked: !expenseValue.isChecked,
    });
    event.stopPropagation();
  }

  isExpenseItemChecked(i: number) {
    const expenseValue = this.expensesFormArray.at(i).getRawValue();
    return expenseValue.isChecked;
  }

  deleteExpenseByIndex(i: number, event: Event) {
    this.expenseDeletionIsLoadingIndex.update(() => i);
    const { weekId, id: expenseId } = this.expensesFormArray
      .at(i)
      .getRawValue();
    this.monthsService
      .deleteExpense(this.month()!.id, weekId, expenseId)
      .pipe(finalize(() => this.stopDeletationLoading()))
      .subscribe(() => this.toaster.success('Votre dépense a été supprimée !'));
    event.stopPropagation();
  }

  expenseDeletionIsLoadingByIndex(i: number) {
    return this.expenseDeletionIsLoadingIndex() === i;
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

  deleteExpense(event: Event) {
    this.expensesFormArray.removeAt(this.expenses.length - 1);
    this.closeExpensesModal();
    event.stopPropagation();
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
      .pipe(finalize(() => (this.formIsLoading = false)))
      .subscribe(() =>
        this.toaster.success('Vos dépenses ont été modifiées !')
      );
  }
}
