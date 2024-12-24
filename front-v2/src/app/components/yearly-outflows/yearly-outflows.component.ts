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
  addOutflowForm: FormGroup | null = null;
  isOutflowsModalOpen = false;
  addOutflowFormIsLoading = false;
  isOutflowNumpadModalOpen = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountValueControl: AbstractControl<any, any> | null = null;
  isBudgetsModalOpen = false;
  addBudgetForm: FormGroup | null = null;
  isBudgetNumpadModalOpen = false;
  addBudgetFormIsLoading = false;
  budgetToDelete: YearlyBudget | null = null;
  budgetDelationModalIsOpen = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBalanceValueControl: AbstractControl<any, any> | null = null;
  activeTabs: string[] = [];

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

  toggleSection(section: string) {
    if (this.activeTabs.includes(section)) {
      this.activeTabs = this.activeTabs.filter((tab) => tab !== section);
    } else {
      this.activeTabs.push(section);
    }
  }

  sectionIsFolded(section: string): boolean {
    return this.activeTabs.includes(section) === false;
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

  // BUDGETS PART

  getBudgetsTotalForMonth(month: number) {
    const budgets = this.getBudgetsForMonth(month);
    return budgets.reduce((total, budget) => total + budget.initialBalance, 0);
  }

  getBudgetsForMonth(month: number) {
    return this.savings()![month].budgets;
  }

  addBudgetToMonth(month: number, event: Event) {
    event.stopPropagation();
    this.isBudgetsModalOpen = true;
    this.setAddBudgetForm(month);
  }

  setAddBudgetForm(month: number) {
    this.addBudgetForm = this.fb.group({
      type: [{ value: 'budget', disabled: true }], // hidden
      month: [{ value: month, disabled: true }], // hidden
      name: [null, Validators.required],
      initialBalance: [0, [Validators.required, amountValidator()]],
    });
  }

  closeBudgetsModal() {
    this.isBudgetsModalOpen = false;
  }

  openBudgetDelationModal(budget: YearlyBudget, event: Event) {
    this.budgetDelationModalIsOpen = true;
    this.budgetToDelete = budget;
    event.stopPropagation();
  }

  closeBudgetDelationModal(event: Event) {
    this.budgetDelationModalIsOpen = false;
    this.budgetToDelete = null;
    event.stopPropagation();
  }

  openBudgetNumpad(control: AbstractControl, event: Event) {
    this.initialBalanceValueControl = control;
    this.isBudgetNumpadModalOpen = true;
    event.stopPropagation();
  }

  closeBudgetNumpad(event: Event) {
    this.isBudgetNumpadModalOpen = false;
    event.stopPropagation();
  }

  get initialBalanceValue() {
    return '' + this.initialBalanceValueControl?.value;
  }

  updateInitialBalanceValue(value: string) {
    this.initialBalanceValueControl?.patchValue(
      Number(value.replace(',', '.'))
    );
    this.isBudgetNumpadModalOpen = false;
    this.initialBalanceValueControl = null;
  }

  submitBudgetModal(event: Event) {
    event.preventDefault();
    if (this.addBudgetForm && this.addBudgetForm!.valid) {
      this.addBudgetFormIsLoading = true;
      this.yearlyOutflowsService
        .add(this.addBudgetForm.getRawValue())
        .pipe(finalize(() => (this.addBudgetFormIsLoading = false)))
        .subscribe(() => {
          this.closeBudgetsModal();
          this.toaster.success('Votre budget annuel a été ajouté !');
        });
    } else {
      this.addBudgetForm!.markAllAsTouched();
    }
    event.stopPropagation();
  }

  removeBudget(event: Event) {
    this.removeIsLoading = true;
    event.stopPropagation();
    this.yearlyOutflowsService
      .remove(this.budgetToDelete!.id)
      .pipe(
        finalize(() => {
          this.removeIsLoading = false;
          this.budgetDelationModalIsOpen = false;
        })
      )
      .subscribe(() => {
        this.toaster.success('Le budget annuel ont été supprimé !');
      });
  }

  // OUTFLOWS PART

  getOutflowsTotalForMonth(month: number) {
    const outflows = this.getOutflowsForMonth(month);
    return outflows.reduce((total, outflow) => total + outflow.amount, 0);
  }

  getOutflowsForMonth(month: number) {
    return this.savings()![month].outflows;
  }

  addOutflowToMonth(month: number, event: Event) {
    event.stopPropagation();
    this.isOutflowsModalOpen = true;
    this.setAddOutflowForm(month);
  }

  setAddOutflowForm(month: number) {
    this.addOutflowForm = this.fb.group({
      type: [{ value: 'outflow', disabled: true }], // hidden
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

  closeOutflowDelationModal(event: Event) {
    this.outflowDelationModalIsOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  openOutflowNumpad(control: AbstractControl, event: Event) {
    this.amountValueControl = control;
    this.isOutflowNumpadModalOpen = true;
    event.stopPropagation();
  }

  closeOutflowNumpad(event: Event) {
    this.isOutflowNumpadModalOpen = false;
    event.stopPropagation();
  }

  get amountValue() {
    return '' + this.amountValueControl?.value;
  }

  updateAmountValue(value: string) {
    this.amountValueControl?.patchValue(Number(value.replace(',', '.')));
    this.isOutflowNumpadModalOpen = false;
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
