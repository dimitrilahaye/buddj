import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MonthCreationTemplate,
  MonthTemplate,
  PendingDebit,
} from '../../models/monthTemplate.model';
import { Month, Outflow, WeeklyBudget } from '../../models/month.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { amountValidator } from '../../validators/amount.validator';
import { dateValidator } from '../../validators/date.validator';
import * as dateUtils from '../../utils/date';
import { CommonModule } from '@angular/common';
import { DesignSystemModule } from '../../design-system/design-system.module';
import MonthsServiceInterface, {
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster.service.interface';
import { ToggleVisibilityButtonComponent } from './toggle-visibility-button/toggle-visibility-button.component';

@Component({
  selector: 'app-month-creation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DesignSystemModule,
    ToggleVisibilityButtonComponent,
  ],
  templateUrl: './month-creation.component.html',
  styleUrl: './month-creation.component.scss',
})
export class MonthCreationComponent implements OnInit {
  dataLoaded = false;
  form!: FormGroup;
  template: MonthCreationTemplate | null = null;
  isOutflowsModalOpen = false;
  isNumpadModalOpen = false;
  isWeeklyBudgetsModalOpen = false;
  selectedOutflowIndex: number | null = null;
  selectedWeeklyBudgetIndex: number | null = null;
  creationLoader = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountValueControl: AbstractControl<any, any> | null = null;
  takeIntoAccountPendingDebits = true;
  outflowsRemovedFromForecastBalance: number[] = [];

  newMonth: Month = {
    month: new Date(),
    startingBalance: 0,
    weeklyBudgets: [],
    outflows: [],
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface,
    @Inject(MONTHS_SERVICE)
    private readonly monthsService: MonthsServiceInterface
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.template = {
        ...data['template'],
        template: {
          ...data['template'].template,
          outflows: (data['template'].template as MonthTemplate).outflows.sort(
            (a, b) => a.label.localeCompare(b.label)
          ),
        },
      };
      this.setNewMonthData();

      this.setForm();

      this.dataLoaded = true;
    });
  }

  togglePendingDebits(event: Event) {
    this.takeIntoAccountPendingDebits = !this.takeIntoAccountPendingDebits;
    event.preventDefault();
  }

  toggleVisibilityForOutflowWithIndex(index: number) {
    if (this.outflowsRemovedFromForecastBalance.includes(index)) {
      this.outflowsRemovedFromForecastBalance =
        this.outflowsRemovedFromForecastBalance.filter((i) => i !== index);
    } else {
      this.outflowsRemovedFromForecastBalance.push(index);
    }
  }

  private setForm() {
    this.form = this.fb.group({
      month: [
        dateUtils.formatToYYYYMM(this.newMonth.month),
        [Validators.required, dateValidator()],
      ],
      startingBalance: [
        this.newMonth.startingBalance,
        [Validators.required, amountValidator()],
      ],
      pendingDebits: this.fb.array([]),
      outflows: this.fb.array([]),
      weeklyBudgets: this.fb.array([]),
    });

    this.newMonth.outflows.forEach((outflow) => this.addOutflow(outflow));
    this.newMonth.weeklyBudgets.forEach((weeklyBudget) =>
      this.addWeeklyBudgets(weeklyBudget)
    );
    this.template?.pendingDebits.forEach((debit) => this.addDebit(debit));
  }

  backToHome() {
    this.router.navigate(['home']);
  }

  createNewMonth(newMonth: Month) {
    this.creationLoader = true;
    this.monthsService
      .createMonth(newMonth)
      .pipe(
        finalize(() => {
          this.creationLoader = false;
        })
      )
      .subscribe(() => {
        this.toaster.success('Votre mois a bien été crée !');
        this.backToHome();
      });
  }

  get forecastBalance() {
    const outflowsTakenIntoAccount = (this.form.value as Month).outflows.filter(
      (_outflow, i) => {
        return !this.outflowsRemovedFromForecastBalance.includes(i);
      }
    );
    const totalOutflows = outflowsTakenIntoAccount.reduce(
      (total, { amount }) => {
        return total + amount;
      },
      0
    );
    const totalWeeklyBudgets = (this.form.value as Month).weeklyBudgets.reduce(
      (total, { initialBalance }) => {
        return total + initialBalance;
      },
      0
    );
    const totalDebits = this.getPendingDebitsTotal();

    let total = totalOutflows + totalWeeklyBudgets;

    if (this.takeIntoAccountPendingDebits) {
      total += totalDebits;
    }

    const forecastBalance = (this.form.value as Month).startingBalance - total;

    return forecastBalance.toFixed(2);
  }

  getPendingDebitsTotal() {
    return (this.form.value.pendingDebits as PendingDebit[]).reduce(
      (total, { amount }) => {
        return total + amount;
      },
      0
    );
  }

  resetForm(event: Event) {
    this.setNewMonthData();
    this.setForm();
    event.stopPropagation();
  }

  private setNewMonthData() {
    this.newMonth.month = new Date(this.template!.template.month);
    this.newMonth.startingBalance = this.template!.template.startingBalance;
    this.newMonth.weeklyBudgets = this.template!.template.weeklyBudgets;
    this.newMonth.outflows = this.template!.template.outflows;
  }

  /*
  ################ Outflows managment ################
  */

  addDebit(debit: PendingDebit) {
    const debitGroup = this.fb.group({
      label: [debit.label, Validators.required],
      amount: [debit.amount, [Validators.required, amountValidator()]],
      type: [{ value: debit.type, disabled: true }],
      id: [{ value: debit.id, disabled: true }],
      monthId: [{ value: debit.monthId, disabled: true }],
      monthDate: [{ value: debit.monthDate, disabled: true }],
    });
    this.pendingDebits.push(debitGroup);
  }

  get pendingDebits(): FormArray {
    return this.form.get('pendingDebits') as FormArray;
  }

  addOutflow(outflow: Outflow) {
    const outflowGroup = this.fb.group({
      label: [outflow.label, Validators.required],
      amount: [outflow.amount, [Validators.required, amountValidator()]],
    });
    this.outflows.push(outflowGroup);
  }

  get outflows(): FormArray {
    return this.form.get('outflows') as FormArray;
  }

  addNewOutflow(event: Event) {
    const outflowGroup = this.fb.group({
      label: ['???', Validators.required],
      amount: [0, [Validators.required, amountValidator()]],
    });
    this.outflows.push(outflowGroup);
    this.openOutflowsModal(this.outflows.length - 1);
    event.stopPropagation();
  }

  openOutflowsModal(index: number, event?: Event) {
    setTimeout(() => {
      this.isOutflowsModalOpen = true;
    }, 0);
    this.selectedOutflowIndex = index;
    event?.stopPropagation();
  }

  closeOutflowsModal() {
    this.isOutflowsModalOpen = false;
  }

  submitOutflowModal(event: Event) {
    event.preventDefault();
    if (this.selectedOutflowIndex !== null && this.form.valid) {
      const updatedOutflow = this.outflows.at(this.selectedOutflowIndex);
      const outflowsArray = this.form.get('outflows') as FormArray;
      updatedOutflow.patchValue(
        outflowsArray.at(this.selectedOutflowIndex)?.value
      );
    }
    this.closeOutflowsModal();
  }

  deleteOutflow(event: Event) {
    if (this.selectedOutflowIndex !== null) {
      this.outflows.removeAt(this.selectedOutflowIndex);
      this.closeOutflowsModal();
    }
    event.stopPropagation();
  }

  get outflowsFormGroup() {
    return this.outflows.at(this.selectedOutflowIndex!) as FormGroup;
  }

  /*
  ################ Weekly budgets managment ################
  */

  addWeeklyBudgets(weeklyBudget: WeeklyBudget) {
    const weeklyBudgetGroup = this.fb.group({
      name: [{ value: weeklyBudget.name, disabled: true }, Validators.required],
      initialBalance: [
        weeklyBudget.initialBalance,
        [Validators.required, amountValidator()],
      ],
    });
    this.weeklyBudgets.push(weeklyBudgetGroup);
  }

  get weeklyBudgets(): FormArray {
    return this.form.get('weeklyBudgets') as FormArray;
  }

  openWeeklyBudgetsModal(index: number, event?: Event) {
    setTimeout(() => {
      this.isWeeklyBudgetsModalOpen = true;
      event?.stopPropagation();
    }, 0);
    this.selectedWeeklyBudgetIndex = index;
  }

  closeWeeklyBudgetsModal() {
    this.isWeeklyBudgetsModalOpen = false;
  }

  submitWeeklyBudgetModal(event: Event) {
    event.preventDefault();
    if (this.selectedWeeklyBudgetIndex !== null && this.form.valid) {
      const updatedWeeklyBudget = this.weeklyBudgets.at(
        this.selectedWeeklyBudgetIndex
      );
      const weeklyBudgetsArray = this.form.get('weeklyBudgets') as FormArray;
      updatedWeeklyBudget.patchValue(
        weeklyBudgetsArray.at(this.selectedWeeklyBudgetIndex)?.value
      );
    }
    this.closeWeeklyBudgetsModal();
  }

  get weeklyBudgetsFormGroup() {
    return this.weeklyBudgets.at(this.selectedWeeklyBudgetIndex!) as FormGroup;
  }

  private formatToDate(val: string | Date | null) {
    const currentDay = new Date().getDate();
    const dateValue = val ? new Date(`${val}-${currentDay}`) : null;
    return dateValue?.toISOString() ?? null;
  }

  closeNumpad(event: Event) {
    this.isNumpadModalOpen = false;
    event.stopPropagation();
  }

  openNumpad(control: AbstractControl) {
    this.amountValueControl = control;
    this.isNumpadModalOpen = true;
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
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const month: Month & { pendingDebits: PendingDebit[] } = {
        ...raw,
        month: this.formatToDate(raw.month),
      };
      this.createNewMonth(month);
    } else {
      console.log('Form is invalid');
    }
  }
}
