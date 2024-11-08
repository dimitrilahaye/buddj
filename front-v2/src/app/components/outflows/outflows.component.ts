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
  Account,
  MonthlyBudget,
  Outflow,
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
  MONTHS_SERVICE,
} from '../../services/months/months.service.interface';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';
import { finalize } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';
import { TransferChoiceComponent } from '../transfer-modals/transfer-choice/transfer-choice.component';

@Component({
  selector: 'app-outflows',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DesignSystemModule,
    TransferChoiceComponent,
  ],
  templateUrl: './outflows.component.html',
  styleUrl: './outflows.component.scss',
})
export class OutflowsComponent implements AfterViewInit {
  month: Signal<MonthlyBudget | null> = signal(null);
  outflows: Signal<Outflow[] | null> = signal(null);

  form!: FormGroup;
  addOutflowForm: FormGroup | null = null;
  formIsLoading = false;
  addOutflowFormIsLoading = false;
  isOutflowsModalOpen = false;
  formUpdated = false;
  deleteOutflowFormIsLoading = false;
  outflowDelationModalIsOpen = false;
  outflowToDelete: Outflow | null = null;
  isNumpadModalOpen = false;

  amountValueControl: AbstractControl<any, any> | null = null;

  transferChoiceModalIsOpen = false;
  fromAccountTransfer: Account | null = null;
  fromWeeklyBudgetTransfer: WeeklyBudget | null = null;
  transferIsLoading = false;

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
        const timesNewOutflowHasBeenAsked =
          this.monthlyBudgetsStore.askedForNewOutflow();
        if (timesNewOutflowHasBeenAsked > 0) {
          this.openOutflowsModal();
          this.monthlyBudgetsStore.resetAskForNewOutflow();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
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

  openOutflowDelationModal(outflow: AbstractControl<Outflow>, event: Event) {
    this.outflowDelationModalIsOpen = true;
    this.outflowToDelete = outflow.getRawValue();
    event.stopPropagation();
  }

  closeOutflowDelationModal(event: Event) {
    this.outflowDelationModalIsOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  isOutflowItemChecked(i: number) {
    const outflowValue = this.outflowsFormArray.at(i).getRawValue();
    return outflowValue.isChecked;
  }

  deleteOutflow(event: Event) {
    this.deleteOutflowFormIsLoading = true;
    const outflowId = this.outflowToDelete?.id;
    if (outflowId) {
      this.monthsService
        .deleteOutflow(this.month()!.id, outflowId)
        .pipe(
          finalize(() => {
            this.deleteOutflowFormIsLoading = false;
            this.closeOutflowDelationModal(event);
          })
        )
        .subscribe(() =>
          this.toaster.success('Votre sortie mensuelle a été supprimée !')
        );
    }
    event.stopPropagation();
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

  closeNumpad(event: Event) {
    this.isNumpadModalOpen = false;
    event.stopPropagation();
  }

  openNumpad(control: AbstractControl, event: Event) {
    this.amountValueControl = control;
    this.isNumpadModalOpen = true;
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

  closeTransferChoiceModal(event: Event) {
    this.transferChoiceModalIsOpen = false;
    event.stopPropagation();
  }

  openTransferChoiceModal(event: Event) {
    this.fromAccountTransfer = this.month()?.account ?? null;
    this.transferChoiceModalIsOpen = true;
    event.stopPropagation();
  }

  submitTransfer(data: {
    monthId: string;
    fromType: 'account' | 'weekly-budget';
    fromId: string;
    toType: 'account' | 'weekly-budget';
    toId: string;
  }) {
    this.transferIsLoading = true;
    setTimeout(() => {
      this.transferIsLoading = false;
      this.monthlyBudgetsStore.askForTransferModalClose();
      console.info(data);
    }, 2000);
  }

  onSubmit() {
    this.formIsLoading = true;
    this.monthsService
      .updateOutflowsChecking(this.month()!.id, this.form.getRawValue())
      .pipe(finalize(() => (this.formIsLoading = false)))
      .subscribe(() => {
        this.toaster.success('Vos sorties mensuelles ont été modifiées !');
        this.formUpdated = false;
      });
  }
}
