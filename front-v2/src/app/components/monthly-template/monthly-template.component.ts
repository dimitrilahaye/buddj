import { Component, Inject, OnInit, Signal, signal } from '@angular/core';
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
  outflowDelationModalIsOpen = false;
  outflowToDelete: Outflow | null = null;
  budgetDelationModalIsOpen = false;
  budgetToDelete: Budget | null = null;
  editingTemplate: MonthTemplate | null = null;

  constructor(
    private route: ActivatedRoute,
    @Inject(MONTHLY_TEMPLATES_STORE)
    private readonly monthlyTemplatesStore: MonthlyTemplatesStoreInterface
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id') || '';
    this.templateSignal = this.monthlyTemplatesStore.getById(this.templateId);
    if (this.template) {
      this.editingTemplate = { ...this.template };
    }
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

  get template() {
    return this.templateSignal();
  }

  get isDefaultInfo() {
    return this.editingTemplate?.isDefault ? 'par défault' : 'pas par défaut';
  }

  openOutflowDelationModal(outflow: Outflow, event: Event) {
    this.outflowDelationModalIsOpen = true;
    this.outflowToDelete = outflow;
    event.stopPropagation();
  }

  closeOutflowDelationModal(event: Event) {
    this.outflowDelationModalIsOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  openBudgetDelationModal(budget: Budget, event: Event) {
    this.budgetDelationModalIsOpen = true;
    this.budgetToDelete = budget;
    event.stopPropagation();
  }

  closeBudgetDelationModal(event: Event) {
    this.budgetDelationModalIsOpen = false;
    this.budgetToDelete = null;
    event.stopPropagation();
  }

  defaultChanged(isDefault: boolean) {
    if (this.editingTemplate) {
      this.editingTemplate.isDefault = isDefault;
    }
  }

  editTitle(event: Event) {
    console.info('edit title');
    event.stopPropagation();
  }

  addOutflow(event: Event) {
    console.info('add outflow');
    event.stopPropagation();
  }

  addBudget(event: Event) {
    console.info('add budget');
    event.stopPropagation();
  }
}
