import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonthTemplate } from '../../models/monthTemplate.model';
import { Month, Outflow } from '../../models/month.model';
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

@Component({
  selector: 'app-month-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DesignSystemModule],
  templateUrl: './month-creation.component.html',
  styleUrl: './month-creation.component.scss',
})
export class MonthCreationComponent implements OnInit {
  form!: FormGroup;
  template: MonthTemplate | null = null;
  isOpen = false;
  selectedOutflowIndex: number | null = null;

  newMonth: Month = {
    month: new Date(),
    startingBalance: 0,
    weeklyBudgets: [],
    outflows: [],
  };

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

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
      });

      this.newMonth.outflows.forEach((outflow) => this.addOutflow(outflow));
    });
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

  openModal(index: number) {
    setTimeout(() => {
      this.isOpen = true;
    }, 0);
    this.selectedOutflowIndex = index;
  }

  closeModal() {
    this.isOpen = false;
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
    this.closeModal();
  }

  deleteOutflow() {
    if (this.selectedOutflowIndex !== null) {
      this.outflows.removeAt(this.selectedOutflowIndex);
      this.closeModal();
    }
  }

  get outflowsFormGroup() {
    return this.outflows.at(this.selectedOutflowIndex!) as FormGroup;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
