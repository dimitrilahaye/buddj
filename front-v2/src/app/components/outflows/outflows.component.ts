import {
  Component,
  effect,
  Inject,
  Injector,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { MonthlyBudget, Outflow } from '../../models/monthlyBudget.model';
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

@Component({
  selector: 'app-outflows',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DesignSystemModule],
  templateUrl: './outflows.component.html',
  styleUrl: './outflows.component.scss',
})
export class OutflowsComponent implements OnInit {
  month: Signal<MonthlyBudget | null> = signal(null);
  outflows: Signal<Outflow[] | null> = signal(null);

  form!: FormGroup;
  outflowDeletionIsLoadingIndex: WritableSignal<number | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private injector: Injector,
    @Inject(MONTHS_SERVICE)
    private monthsService: MonthsServiceInterface,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface
  ) {}

  ngOnInit(): void {
    this.month = this.monthlyBudgetsStore.getCurrent();
    this.outflows = this.monthlyBudgetsStore.getCurrentOutflows();
    this.setForm();

    effect(
      () => {
        this.resetOutflows();
      },
      { injector: this.injector }
    );
  }

  private setForm() {
    this.form = this.fb.group({
      outflows: this.fb.array([]),
    });

    this.outflows()!.forEach((outflow) => this.addOutflow(outflow));
  }

  private resetOutflows() {
    this.setForm();
  }

  addOutflow(outflow: Outflow) {
    const outflowGroup = this.fb.group({
      id: [{ value: outflow.id, disabled: true }], // hidden
      label: [outflow.label, Validators.required],
      amount: [outflow.amount, [Validators.required, amountValidator()]],
      isChecked: [{ value: outflow.isChecked, disabled: true }], // hidden
    });
    this.outflowsFormArray.push(outflowGroup);
  }

  get outflowsFormArray(): FormArray {
    return this.form.get('outflows') as FormArray;
  }

  toggleOutflowAtIndex(i: number, event: Event) {
    const outflowControl = this.outflowsFormArray.at(i);
    const outflowValue = this.outflowsFormArray.at(i).getRawValue();
    outflowControl.setValue({
      ...outflowValue,
      isChecked: !outflowValue.isChecked,
    });
    event.stopPropagation();
  }

  isOutflowItemChecked(i: number) {
    const outflowValue = this.outflowsFormArray.at(i).getRawValue();
    return outflowValue.isChecked;
  }

  deleteOutflowByIndex(i: number, event: Event) {
    this.outflowDeletionIsLoadingIndex.update(() => i);
    const outflowToDelete = this.outflowsFormArray.at(i).getRawValue();
    this.monthsService
      .deleteOutflow(this.month()!.id, outflowToDelete.id)
      .pipe(finalize(() => this.stopDeletationLoading()))
      .subscribe();
    event.stopPropagation();
  }

  outflowDeletionIsLoadingByIndex(i: number) {
    return this.outflowDeletionIsLoadingIndex() === i;
  }

  stopDeletationLoading() {
    this.outflowDeletionIsLoadingIndex.update(() => null);
  }

  onSubmit() {
    console.info(this.form.value);
  }
}
