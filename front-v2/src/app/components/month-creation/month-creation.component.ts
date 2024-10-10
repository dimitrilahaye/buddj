import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthTemplate } from '../../models/monthTemplate.model';
import { Month, Outflow, WeeklyBudget } from '../../models/month.model';
import {
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
  MONTHS_SERVICE_SERVICE,
} from '../../services/months/months.service.interface';

@Component({
  selector: 'app-month-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DesignSystemModule],
  templateUrl: './month-creation.component.html',
  styleUrl: './month-creation.component.scss',
})
export class MonthCreationComponent implements OnInit, AfterViewInit {
  @ViewChild('outflowsContainer') outflowsContainer!: ElementRef;
  @ViewChild('addNewOutflowButton') addNewOutflowButton!: ElementRef;

  dataLoaded = false;
  form!: FormGroup;
  template: MonthTemplate | null = null;
  isOutflowsModalOpen = false;
  isWeeklyBudgetsModalOpen = false;
  selectedOutflowIndex: number | null = null;
  selectedWeeklyBudgetIndex: number | null = null;

  newMonth: Month = {
    month: new Date(),
    startingBalance: 0,
    weeklyBudgets: [],
    outflows: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    @Inject(MONTHS_SERVICE_SERVICE)
    private monthsService: MonthsServiceInterface
  ) {}

  ngAfterViewInit(): void {
    if (this.dataLoaded) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.setStyle(
              this.addNewOutflowButton.nativeElement,
              'display',
              'block'
            );
          } else {
            this.renderer.setStyle(
              this.addNewOutflowButton.nativeElement,
              'display',
              'none'
            );
          }
        });
      });

      observer.observe(this.outflowsContainer.nativeElement);
    }
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.template = data['template'];
      this.newMonth.month = new Date(this.template!.month);
      this.newMonth.startingBalance = this.template!.startingBalance;
      this.newMonth.weeklyBudgets = this.template!.weeklyBudgets;
      this.newMonth.outflows = this.template!.outflows;

      this.form = this.fb.group({
        month: [
          dateUtils.formatToYYYYMM(this.newMonth.month),
          [Validators.required, dateValidator()],
        ],
        startingBalance: [
          this.newMonth.startingBalance,
          [Validators.required, amountValidator()],
        ],
        outflows: this.fb.array([]),
        weeklyBudgets: this.fb.array([]),
      });

      this.newMonth.outflows.forEach((outflow) => this.addOutflow(outflow));
      this.newMonth.weeklyBudgets.forEach((weeklyBudget) =>
        this.addWeeklyBudgets(weeklyBudget)
      );

      this.dataLoaded = true;
    });
  }

  backToHome() {
    this.router.navigate(['home']);
  }

  createNewMonth(newMonth: Month) {
    this.monthsService.createMonth(newMonth).subscribe(() => {
      this.backToHome();
    });
  }

  get forecastBalance() {
    const totalOutflows = (this.form.value as Month).outflows.reduce(
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

    const forecastBalance =
      (this.form.value as Month).startingBalance -
      (totalOutflows + totalWeeklyBudgets);

    return forecastBalance.toFixed(2);
  }

  resetForm() {
    this.form.reset({
      month: dateUtils.formatToYYYYMM(this.newMonth.month),
      startingBalance: this.newMonth.startingBalance,
      outflows: this.newMonth.outflows,
      weeklyBudgets: this.newMonth.weeklyBudgets,
    });
  }

  /*
  ################ Outflows managment ################
  */

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

  openOutflowsModal(index: number) {
    setTimeout(() => {
      this.isOutflowsModalOpen = true;
    }, 0);
    this.selectedOutflowIndex = index;
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

  deleteOutflow() {
    if (this.selectedOutflowIndex !== null) {
      this.outflows.removeAt(this.selectedOutflowIndex);
      this.closeOutflowsModal();
    }
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

  openWeeklyBudgetsModal(index: number) {
    setTimeout(() => {
      this.isWeeklyBudgetsModalOpen = true;
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

  private formatToDate(val: string | null) {
    const currentDay = new Date().getDate();
    const dateValue = val ? new Date(`${val}-${currentDay}`) : null;
    return dateValue?.toISOString() ?? null;
  }

  onSubmit() {
    if (this.form.valid) {
      const newMonth = this.form.getRawValue();
      newMonth.month = this.formatToDate(newMonth.month);
      this.createNewMonth(newMonth);
    } else {
      console.log('Form is invalid');
    }
  }
}
