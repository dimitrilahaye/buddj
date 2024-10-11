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
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-outflows',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DesignSystemModule],
  templateUrl: './outflows.component.html',
  styleUrl: './outflows.component.scss',
})
export class OutflowsComponent implements AfterViewInit {
  month: Signal<MonthlyBudget | null> = signal(null);
  outflows: Signal<Outflow[] | null> = signal(null);

  form!: FormGroup;
  addOutflowForm: FormGroup | null = null;
  outflowDeletionIsLoadingIndex: WritableSignal<number | null> = signal(null);
  formIsLoading = false;
  addOutflowFormIsLoading = false;
  isOutflowsModalOpen = false;

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
    this.outflows = this.monthlyBudgetsStore.getCurrentOutflows();

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
        const timesNewOutflowHasBeenAsked =
          this.monthlyBudgetsStore.askedForNewOutflow();
        if (timesNewOutflowHasBeenAsked > 0) {
          this.openOutflowsModal();
        }
      },
      { injector: this.injector }
    );
  }

  private setForm() {
    this.form = this.fb.group({
      currentBalance: [
        this.month()!.dashboard.account.currentBalance,
        [Validators.required, amountValidator()],
      ],
      outflows: this.fb.array([]),
    });

    this.outflows()!.forEach((outflow) => this.addOutflow(outflow));
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

  setAddOutflowForm() {
    this.addOutflowForm = this.fb.group({
      label: [null, Validators.required],
      amount: [0, [Validators.required, amountValidator()]],
    });
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
      .subscribe(() =>
        this.toaster.success('Votre sortie mensuelle a été supprimée !')
      );
    event.stopPropagation();
  }

  outflowDeletionIsLoadingByIndex(i: number) {
    return this.outflowDeletionIsLoadingIndex() === i;
  }

  stopDeletationLoading() {
    this.outflowDeletionIsLoadingIndex.update(() => null);
  }

  openOutflowsModal() {
    this.isOutflowsModalOpen = true;
    this.setAddOutflowForm();
  }

  closeOutflowsModal() {
    this.isOutflowsModalOpen = false;
  }

  submitOutflowModal(event: Event) {
    event.preventDefault();
    if (this.addOutflowForm && this.addOutflowForm!.valid) {
      this.addOutflowFormIsLoading = true;
      this.monthsService
        .addOutflow(this.month()!.id, this.addOutflowForm.getRawValue())
        .pipe(finalize(() => (this.addOutflowFormIsLoading = false)))
        .subscribe(() => {
          this.closeOutflowsModal();
          this.toaster.success('Votre sortie mensuelle a été ajoutée !');
        });
    } else {
      this.addOutflowForm!.markAllAsTouched();
    }
    event.stopPropagation();
  }

  deleteOutflow(event: Event) {
    this.outflowsFormArray.removeAt(this.outflows.length - 1);
    this.closeOutflowsModal();
    event.stopPropagation();
  }

  onSubmit() {
    this.formIsLoading = true;
    this.monthsService
      .updateOutflowsChecking(this.month()!.id, this.form.getRawValue())
      .pipe(finalize(() => (this.formIsLoading = false)))
      .subscribe(() =>
        this.toaster.success('Vos sorties mensuelles ont été modifiées !')
      );
  }
}
