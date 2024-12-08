import {
  Component,
  computed,
  Inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MONTHLY_TEMPLATES_STORE,
  MonthlyTemplatesStoreInterface,
} from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';
import {
  Budget,
  MonthTemplate,
  Outflow,
} from '../../models/monthTemplate.model';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { HeaderBackToHomeComponent } from '../header-back-to-home/header-back-to-home.component';
import { CommonModule } from '@angular/common';
import MonthTemplatesServiceInterface, {
  MONTH_TEMPLATES_SERVICE,
} from '../../services/monthTemplates/monthTemplates.service.interface';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';

@Component({
  selector: 'app-monthly-template',
  standalone: true,
  imports: [CommonModule, DesignSystemModule, HeaderBackToHomeComponent],
  templateUrl: './monthly-template.component.html',
  styleUrl: './monthly-template.component.scss',
})
export class MonthlyTemplateComponent implements OnInit {
  templateId: string | null = null;
  templateSignal: Signal<MonthTemplate | null> = signal(null);
  editingTemplateSignal!: Signal<MonthTemplate | null>;
  isTemplateNameModalOpen = false;
  isLoading = false;
  // remove outflow
  isRemoveOutflowModalOpen = false;
  outflowToDelete: Outflow | null = null;
  // remove budget
  isRemoveBudgetModalOpen = false;
  budgetToDelete: Budget | null = null;
  // add outflow
  isAddOutflowModalOpen = false;
  editingOutflow: Omit<Outflow, 'id' | 'isChecked'> | null = null;
  // add budget
  isAddBudgetModalOpen = false;
  editingBudget: Omit<Budget, 'id'> | null = null;
  // numpad
  isNumpadModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    @Inject(MONTHLY_TEMPLATES_STORE)
    private readonly monthlyTemplatesStore: MonthlyTemplatesStoreInterface,
    @Inject(MONTH_TEMPLATES_SERVICE)
    private readonly monthlyTemplatesService: MonthTemplatesServiceInterface,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface
  ) {}

  ngOnInit(): void {
    this.initializeEditingTemplate();
  }

  initializeEditingTemplate() {
    this.templateId = this.route.snapshot.paramMap.get('id') || '';
    this.templateSignal = this.monthlyTemplatesStore.getById(this.templateId);
    this.editingTemplateSignal = computed(() => {
      return this.template
        ? ({
            ...this.template,
            outflows: [...this.template.outflows],
            budgets: [...this.template.budgets],
          } as MonthTemplate)
        : null;
    });
  }

  get editingTemplate() {
    return this.editingTemplateSignal();
  }

  get total() {
    const totalOutflows =
      this.editingTemplate?.outflows.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0) ?? 0;
    const totalBudgets =
      this.editingTemplate?.budgets.reduce((prev, curr) => {
        return prev + curr.initialBalance;
      }, 0) ?? 0;
    return totalBudgets + totalOutflows;
  }

  get template(): MonthTemplate | null {
    return this.templateSignal();
  }

  get isDefaultInfo() {
    return this.editingTemplate?.isDefault ? 'par défault' : 'pas par défaut';
  }

  defaultChanged(isDefault: boolean) {
    if (this.editingTemplate) {
      this.editingTemplate.isDefault = isDefault;
      this.updateTemplate(this.editingTemplate);
    }
  }

  // update template name
  openTemplateNameModal(event: Event) {
    this.isTemplateNameModalOpen = true;
    event.stopPropagation();
  }

  submitUpdateTemplateName(event: Event) {
    if (this.editingTemplate) {
      this.updateTemplate(this.editingTemplate);
    }
    event.stopPropagation();
  }

  cancelNameUpdate(event: Event) {
    this.isTemplateNameModalOpen = false;
    event.stopPropagation();
    if (!this.editingTemplate || !this.template) {
      return;
    }
    this.editingTemplate.name = this.template.name;
  }

  updateTemplateName(event: Event) {
    if (!this.editingTemplate) {
      return;
    }
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    this.editingTemplate.name = inputValue;
  }

  // remove outflow
  openOutflowDelationModal(outflow: Outflow, event: Event) {
    this.isRemoveOutflowModalOpen = true;
    this.outflowToDelete = outflow;
    event.stopPropagation();
  }

  closeOutflowDelationModal(event: Event) {
    this.isRemoveOutflowModalOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  removeOutflow(event: Event) {
    if (this.outflowToDelete && this.editingTemplate) {
      this.isLoading = true;
      this.monthlyTemplatesService
        .deleteOutflow(this.editingTemplate.id, this.outflowToDelete.id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.isRemoveOutflowModalOpen = false;
            this.outflowToDelete = null;
          })
        )
        .subscribe(() => {
          this.toaster.success('Votre sortie mensuelle a bien été supprimée !');
        });
      event.stopPropagation();
    }
  }

  // remove budget
  openBudgetDelationModal(budget: Budget, event: Event) {
    this.isRemoveBudgetModalOpen = true;
    this.budgetToDelete = budget;
    event.stopPropagation();
  }

  closeBudgetDelationModal(event: Event) {
    this.isRemoveBudgetModalOpen = false;
    this.budgetToDelete = null;
    event.stopPropagation();
  }

  removeBudget(event: Event) {
    if (this.budgetToDelete && this.editingTemplate) {
      this.isLoading = true;
      this.monthlyTemplatesService
        .deleteBudget(this.editingTemplate.id, this.budgetToDelete.id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.isRemoveBudgetModalOpen = false;
            this.budgetToDelete = null;
          })
        )
        .subscribe(() => {
          this.toaster.success('Votre budget a bien été supprimé !');
        });
      event.stopPropagation();
    }
  }

  // add outflow
  openAddOutflowModal() {
    this.isAddOutflowModalOpen = true;
    this.editingOutflow = {
      amount: 0,
      label: '',
    };
  }

  closeAddOutflowModal(event: Event) {
    this.isAddOutflowModalOpen = false;
    this.editingOutflow = null;
    event.stopPropagation();
  }

  updateAddingOutflowLabel(event: Event) {
    if (!this.editingOutflow) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.editingOutflow.label = value;
  }

  addOutflow(event: Event) {
    if (this.editingTemplate && this.editingOutflow) {
      this.editingTemplate.outflows.push({
        ...this.editingOutflow,
        id: '',
        isChecked: false,
      });
    }
    this.closeAddOutflowModal(event);
  }

  // add budget
  openAddBudgetModal() {
    this.isAddBudgetModalOpen = true;
    this.editingBudget = {
      initialBalance: 0,
      name: '',
    };
  }

  closeAddBudgetModal(event: Event) {
    this.isAddBudgetModalOpen = false;
    this.editingBudget = null;
    event.stopPropagation();
  }

  updateAddingBudgetName(event: Event) {
    if (!this.editingBudget) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.editingBudget.name = value;
  }

  addBudget(event: Event) {
    if (this.editingTemplate && this.editingBudget) {
      this.editingTemplate.budgets.push({
        ...this.editingBudget,
        id: '',
      });
    }
    this.closeAddBudgetModal(event);
  }

  // numpad
  openNumpad(event: Event) {
    this.isNumpadModalOpen = true;
    event.stopPropagation();
  }

  initializeNumpadValue() {
    if (this.editingOutflow) {
      return this.editingOutflow.amount?.toString() ?? '0';
    }
    if (this.editingBudget) {
      return this.editingBudget.initialBalance?.toString() ?? '0';
    }
    return '0';
  }

  closeNumpad(event: Event) {
    this.isNumpadModalOpen = false;
    event.stopPropagation();
  }

  updateAmountValue(value: string) {
    const amount = Number(value.replace(',', '.'));
    if (this.editingOutflow) {
      this.editingOutflow.amount = amount;
    }
    if (this.editingBudget) {
      this.editingBudget.initialBalance = amount;
    }
    this.isNumpadModalOpen = false;
  }

  updateTemplate(template: MonthTemplate) {
    this.isLoading = true;
    this.monthlyTemplatesService
      .updateTemplate(template.id, {
        name: template.name,
        isDefault: template.isDefault,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isTemplateNameModalOpen = false;
        })
      )
      .subscribe({
        next: () => {
          this.toaster.success('Votre template a bien été modifié !');
        },
        error: () => {
          this.initializeEditingTemplate();
        },
      });
  }
}