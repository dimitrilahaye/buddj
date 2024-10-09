import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonthTemplate } from '../../models/monthTemplate.model';
import { Month } from '../../models/month.model';
import {
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

  currentStep = 1;
  newMonth: Month = {
    month: new Date(),
    startingBalance: 0,
    weeklyBudgets: [],
    outflows: [],
  };

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      // get the template and set model
      this.template = data['template'];
      this.newMonth.month = new Date(this.template!.month);
      this.newMonth.startingBalance = this.template!.startingBalance;
      this.newMonth.weeklyBudgets = this.template!.weeklyBudgets;
      this.newMonth.outflows = this.template!.outflows;
      // build form
      this.form = this.fb.group({
        month: [
          dateUtils.formatToYYYYMM(this.newMonth.month),
          [Validators.required, dateValidator()],
        ],
        startingBalance: [
          this.newMonth.startingBalance,
          [Validators.required, amountValidator()],
        ],
      });
    });
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
