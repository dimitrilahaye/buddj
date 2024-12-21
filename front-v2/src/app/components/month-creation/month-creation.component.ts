import { Component, Inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MonthCreationTemplate,
  MonthTemplate,
} from '../../models/monthTemplate.model';
import { Month, Outflow, WeeklyBudget } from '../../models/month.model';
import {
  Outflow as PendingOutflow,
  Budget as PendingBudget,
} from '../../models/monthTemplate.model';
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
} from '../../services/toaster/toaster.service.interface';
import { ToggleVisibilityButtonComponent } from './toggle-visibility-button/toggle-visibility-button.component';
import {
  YEARLY_OUTFLOWS_STORE,
  type YearlyOutflowsStoreInterface,
} from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import { YearlyBudget, YearlyOutflow } from '../../models/yearlyOutflow.model';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';

@Component({
  selector: 'app-month-creation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DesignSystemModule,
    ToggleVisibilityButtonComponent,
    HeaderBackButtonComponent,
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
  takeIntoAccountPendingOutflows = true;
  outflowsRemovedFromForecastBalance: number[] = [];
  yearlyOutflowDelationModalIsOpen = false;
  yearlyBudgetDelationModalIsOpen = false;
  pendingDebitDelationModalIsOpen = false;
  outflowToDelete: AbstractControl<YearlyOutflow> | null = null;
  removeIsLoading = false;
  selectedYearlyOutflowIndex: number | null = null;
  selectedYearlyBudgetIndex: number | null = null;
  selectedPendingOutflowIndex: number | null = null;

  newMonth: Month = {
    month: new Date(),
    startingBalance: 0,
    weeklyBudgets: [],
    outflows: [],
  };
  yearlyOutflows: Signal<YearlyOutflow[]> = signal([]);
  yearlyBudgets: Signal<YearlyBudget[]> = signal([]);
  currentSelectedMonth: number | null = null;
  takeIntoAccountYearlyOutflows = true;
  takeIntoAccountYearlyBudgets = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface,
    @Inject(MONTHS_SERVICE)
    private readonly monthsService: MonthsServiceInterface,
    @Inject(YEARLY_OUTFLOWS_STORE)
    private readonly yearlyOutflowsStore: YearlyOutflowsStoreInterface
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      if (data['template'].template === null) {
        this.template = null;
        this.dataLoaded = true;
        return;
      }

      this.template = {
        ...data['template'],
        template: {
          ...data['template'].template,
          outflows: (data['template'].template as MonthTemplate).outflows.sort(
            (a, b) => a.label.localeCompare(b.label)
          ),
          budgets: (data['template'].template as MonthTemplate).budgets.sort(
            (a, b) => a.name.localeCompare(b.name)
          ),
        },
      };
      this.setNewMonthData();

      this.setForm();

      this.dataLoaded = true;
    });
  }

  goToTemplatesPage() {
    this.router.navigate(['monthly-templates']);
  }

  togglePendingOutflows() {
    this.takeIntoAccountPendingOutflows = !this.takeIntoAccountPendingOutflows;
  }

  toggleYearlyOutflows() {
    this.takeIntoAccountYearlyOutflows = !this.takeIntoAccountYearlyOutflows;
  }

  toggleYearlyBudgets() {
    this.takeIntoAccountYearlyBudgets = !this.takeIntoAccountYearlyBudgets;
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
      pendingOutflows: this.fb.array([]),
      yearlyOutflows: this.fb.array([]),
      yearlyBudgets: this.fb.array([]),
      outflows: this.fb.array([]),
      weeklyBudgets: this.fb.array([]),
    });

    this.newMonth.outflows.forEach((outflow) => this.addOutflow(outflow));
    this.newMonth.weeklyBudgets.forEach((weeklyBudget) =>
      this.addWeeklyBudgets(weeklyBudget)
    );
    this.template?.pendingDebits.outflows.forEach((outflow) =>
      this.addPendingOutflow(outflow)
    );
    this.currentSelectedMonth = this.newMonth.month.getMonth() + 1;
    this.updateYearlyOutflowsControls(this.currentSelectedMonth);
    this.updateYearlyBudgetsControls(this.currentSelectedMonth);

    this.form.valueChanges.subscribe((value) => {
      const month = Number(value.month.split('-').at(-1));
      if (this.currentSelectedMonth !== month) {
        this.currentSelectedMonth = month;
        this.updateYearlyOutflowsControls(this.currentSelectedMonth);
        this.updateYearlyBudgetsControls(this.currentSelectedMonth);
      }
    });
  }

  private updateYearlyOutflowsControls(month: number) {
    this.yearlyOutflowsControls.clear();
    const savings = this.yearlyOutflowsStore.getSavingsForMonth(month);
    this.yearlyOutflows = signal(savings().outflows);
    this.yearlyOutflows().forEach((yearlyOutflow) =>
      this.addYearlyOutflow(yearlyOutflow)
    );
  }

  private updateYearlyBudgetsControls(month: number) {
    this.yearlyBudgetsControls.clear();
    const savings = this.yearlyOutflowsStore.getSavingsForMonth(month);
    this.yearlyBudgets = signal(savings().budgets);
    this.yearlyBudgets().forEach((yearlyBudget) =>
      this.addYearlyBudget(yearlyBudget)
    );
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
    const totalPendingOutflows = this.getPendingOutflowsTotal();
    const totalYearlyOutflows = this.getYearlyOutflowsTotal();
    const totalYearlyBudgets = this.getYearlyBudgetsTotal();

    let total = totalOutflows + totalWeeklyBudgets;

    if (this.takeIntoAccountPendingOutflows) {
      total += totalPendingOutflows;
    }
    if (this.takeIntoAccountYearlyOutflows) {
      total += totalYearlyOutflows;
    }
    if (this.takeIntoAccountYearlyBudgets) {
      total += totalYearlyBudgets;
    }

    const forecastBalance = (this.form.value as Month).startingBalance - total;

    return forecastBalance.toFixed(2);
  }

  getPendingOutflowsTotal() {
    return (this.form.value.pendingOutflows as PendingOutflow[]).reduce(
      (total, { amount }) => {
        return total + amount;
      },
      0
    );
  }

  getYearlyOutflowsTotal() {
    return (this.form.value.yearlyOutflows as YearlyOutflow[]).reduce(
      (total, { amount }) => {
        return total + amount;
      },
      0
    );
  }

  getYearlyBudgetsTotal() {
    return (this.form.value.yearlyBudgets as YearlyBudget[]).reduce(
      (total, { initialBalance }) => {
        return total + initialBalance;
      },
      0
    );
  }

  resetForm(event: Event) {
    this.outflowsRemovedFromForecastBalance = [];
    this.setNewMonthData();
    this.setForm();
    event.stopPropagation();
  }

  private setNewMonthData() {
    this.newMonth.month = new Date(this.template!.template.month);
    this.newMonth.startingBalance = this.template!.template.startingBalance;
    this.newMonth.weeklyBudgets = this.template!.template.budgets;
    this.newMonth.outflows = this.template!.template.outflows;
  }

  /*
  ################ Outflows managment ################
  */

  addPendingOutflow(outflow: PendingOutflow) {
    const debitGroup = this.fb.group({
      label: [`🛒 ${outflow.label}`, Validators.required],
      amount: [outflow.amount, [Validators.required, amountValidator()]],
      id: [{ value: outflow.id, disabled: true }],
    });
    this.pendingOutflows.push(debitGroup);
  }

  addYearlyOutflow(yearlyOutflow: YearlyOutflow) {
    const outflowGroup = this.fb.group({
      label: [`📆 ${yearlyOutflow.label}`, Validators.required],
      amount: [yearlyOutflow.amount, [Validators.required, amountValidator()]],
      id: [{ value: yearlyOutflow.id, disabled: true }],
    });
    this.yearlyOutflowsControls.push(outflowGroup);
  }

  addYearlyBudget(yearlyBudget: YearlyBudget) {
    const outflowGroup = this.fb.group({
      name: [`📆 ${yearlyBudget.name}`, Validators.required],
      initialBalance: [
        yearlyBudget.initialBalance,
        [Validators.required, amountValidator()],
      ],
      id: [{ value: yearlyBudget.id, disabled: true }],
    });
    this.yearlyBudgetsControls.push(outflowGroup);
  }

  get pendingOutflows(): FormArray {
    return this.form.get('pendingOutflows') as FormArray;
  }

  get yearlyOutflowsControls(): FormArray {
    return this.form.get('yearlyOutflows') as FormArray;
  }

  get yearlyBudgetsControls(): FormArray {
    return this.form.get('yearlyBudgets') as FormArray;
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

  openYearlyOutflowDelationModal(index: number, event: Event) {
    this.yearlyOutflowDelationModalIsOpen = true;
    this.selectedYearlyOutflowIndex = index;
    event.stopPropagation();
  }

  closeYearlyOutflowDelationModal(event: Event) {
    this.yearlyOutflowDelationModalIsOpen = false;
    this.selectedYearlyOutflowIndex = null;
    event.stopPropagation();
  }

  removeYearlyOutflow(event: Event) {
    if (this.selectedYearlyOutflowIndex !== null) {
      this.yearlyOutflowsControls.removeAt(this.selectedYearlyOutflowIndex);
      this.closeYearlyOutflowDelationModal(event);
    }
    event.stopPropagation();
  }

  openYearlyBudgetDelationModal(index: number, event: Event) {
    this.yearlyBudgetDelationModalIsOpen = true;
    this.selectedYearlyBudgetIndex = index;
    event.stopPropagation();
  }

  closeYearlyBudgetDelationModal(event: Event) {
    this.yearlyBudgetDelationModalIsOpen = false;
    this.selectedYearlyBudgetIndex = null;
    event.stopPropagation();
  }

  removeYearlyBudget(event: Event) {
    if (this.selectedYearlyBudgetIndex !== null) {
      this.yearlyBudgetsControls.removeAt(this.selectedYearlyBudgetIndex);
      this.closeYearlyBudgetDelationModal(event);
    }
    event.stopPropagation();
  }

  openPendingDebitDelationModal(index: number, event: Event) {
    this.pendingDebitDelationModalIsOpen = true;
    this.selectedPendingOutflowIndex = index;
    event.stopPropagation();
  }

  closePendingDebitDelationModal(event: Event) {
    this.pendingDebitDelationModalIsOpen = false;
    this.selectedPendingOutflowIndex = null;
    event.stopPropagation();
  }

  removePendingOutflow(event: Event) {
    if (this.selectedPendingOutflowIndex !== null) {
      this.pendingOutflows.removeAt(this.selectedPendingOutflowIndex);
      this.closePendingDebitDelationModal(event);
    }
    event.stopPropagation();
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

  private formatToDate(val: string) {
    const currentDay = new Date().getDate();
    const dateValue = new Date(`${val}-${currentDay}`);
    return dateValue;
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

  onSubmit(event: Event) {
    event.stopPropagation();
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const yearlyOutflows = raw.yearlyOutflows.map((o: YearlyOutflow) => ({
        label: o.label,
        amount: o.amount,
      }));
      const yearlyBudgets = raw.yearlyBudgets.map((o: YearlyBudget) => ({
        name: o.name,
        initialBalance: o.initialBalance,
      }));
      const pendingOutflows = raw.pendingOutflows;
      raw.outflows.push(...yearlyOutflows);
      const month: Month = {
        outflows: [...raw.outflows, ...pendingOutflows],
        startingBalance: raw.startingBalance,
        weeklyBudgets: [...yearlyBudgets, ...raw.weeklyBudgets],
        month: this.formatToDate(raw.month),
      };
      console.info(month);
      this.createNewMonth(month);
    } else {
      console.log('Form is invalid');
    }
  }
}
