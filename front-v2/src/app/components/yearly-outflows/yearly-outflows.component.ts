import { Component, Inject, Signal } from '@angular/core';
import {
  YEARLY_OUTFLOWS_STORE,
  YearlyOutflowsStoreInterface,
} from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import {
  YearlyBudget,
  YearlyOutflow,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';
import { CommonModule } from '@angular/common';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { Router } from '@angular/router';
import YearlyOutflowsServiceInterface, {
  YEARLY_OUTFLOWS_SERVICE,
} from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { amountValidator } from '../../validators/amount.validator';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';

@Component({
  selector: 'app-yearly-outflows',
  standalone: true,
  imports: [
    DesignSystemModule,
    CommonModule,
    ReactiveFormsModule,
    HeaderBackButtonComponent,
  ],
  templateUrl: './yearly-outflows.component.html',
  styleUrl: './yearly-outflows.component.scss',
})
export class YearlyOutflowsComponent {
  savings: Signal<YearlyOutflows | null>;
  removeIsLoading = false;
  outflowDelationModalIsOpen = false;
  outflowToDelete: YearlyOutflow | null = null;
  budgetToDelete: YearlyBudget | null = null;
  addOutflowForm: FormGroup | null = null;
  isOutflowsModalOpen = false;
  addOutflowFormIsLoading = false;
  isNumpadModalOpen = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountValueControl: AbstractControl<any, any> | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    @Inject(YEARLY_OUTFLOWS_STORE)
    private readonly yearlyOutflowsStore: YearlyOutflowsStoreInterface,
    @Inject(YEARLY_OUTFLOWS_SERVICE)
    private readonly yearlyOutflowsService: YearlyOutflowsServiceInterface,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface
  ) {
    this.savings = this.yearlyOutflowsStore.getAll();
  }

  get months() {
    return [
      {
        month: 1,
        label: 'Janvier',
      },
      {
        month: 2,
        label: 'Février',
      },
      {
        month: 3,
        label: 'Mars',
      },
      {
        month: 4,
        label: 'Avril',
      },
      {
        month: 5,
        label: 'Mai',
      },
      {
        month: 6,
        label: 'Juin',
      },
      {
        month: 7,
        label: 'Juillet',
      },
      {
        month: 8,
        label: 'Août',
      },
      {
        month: 9,
        label: 'Septembre',
      },
      {
        month: 10,
        label: 'Octobre',
      },
      {
        month: 11,
        label: 'Novembre',
      },
      {
        month: 12,
        label: 'Décembre',
      },
    ];
  }

  get totalAmountByMonth() {
    const yearlyOutflows = this.savings()!;
    let total = 0;
    for (const monthKey in yearlyOutflows) {
      const month = parseInt(monthKey, 10);
      const savings = yearlyOutflows[month];
      total += savings.outflows.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      total += savings.budgets.reduce((prev, curr) => {
        return prev + curr.initialBalance;
      }, 0);
    }
    return total / 12;
  }

  getOutflowsForMonth(month: number) {
    return this.savings()![month].outflows;
  }

  getBudgetsForMonth(month: number) {
    return this.savings()![month].budgets;
  }

  addOutflowToMonth(month: number, event: Event) {
    event.stopPropagation();
    this.isOutflowsModalOpen = true;
    this.setAddOutflowForm(month);
  }

  setAddOutflowForm(month: number) {
    this.addOutflowForm = this.fb.group({
      month: [{ value: month, disabled: true }], // hidden
      label: [null, Validators.required],
      amount: [0, [Validators.required, amountValidator()]],
    });
  }

  closeOutflowsModal() {
    this.isOutflowsModalOpen = false;
  }

  openOutflowDelationModal(outflow: YearlyOutflow, event: Event) {
    this.outflowDelationModalIsOpen = true;
    this.outflowToDelete = outflow;
    event.stopPropagation();
  }

  openBudgetDelationModal(budget: YearlyBudget, event: Event) {
    this.outflowDelationModalIsOpen = true;
    this.budgetToDelete = budget;
    event.stopPropagation();
  }

  closeOutflowDelationModal(event: Event) {
    this.outflowDelationModalIsOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  openNumpad(control: AbstractControl, event: Event) {
    this.amountValueControl = control;
    this.isNumpadModalOpen = true;
    event.stopPropagation();
  }

  closeNumpad(event: Event) {
    this.isNumpadModalOpen = false;
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

  submitOutflowModal(event: Event) {
    event.preventDefault();
    if (this.addOutflowForm && this.addOutflowForm!.valid) {
      this.addOutflowFormIsLoading = true;
      this.yearlyOutflowsService
        .add(this.addOutflowForm.getRawValue())
        .pipe(finalize(() => (this.addOutflowFormIsLoading = false)))
        .subscribe(() => {
          this.closeOutflowsModal();
          this.toaster.success('Votre sortie annuelle a été ajoutée !');
        });
    } else {
      this.addOutflowForm!.markAllAsTouched();
    }
    event.stopPropagation();
  }

  removeOutflow(event: Event) {
    this.removeIsLoading = true;
    event.stopPropagation();
    this.yearlyOutflowsService
      .remove(this.outflowToDelete!.id)
      .pipe(
        finalize(() => {
          this.removeIsLoading = false;
          this.outflowDelationModalIsOpen = false;
        })
      )
      .subscribe(() => {
        this.toaster.success('La sortie annuelle ont été supprimée !');
      });
  }
}
