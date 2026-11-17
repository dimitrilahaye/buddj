import type { DefaultNewMonthBundle } from '../new-month/default-new-month-bundle.js';
import type { TemplateView } from './template-view.js';

export type UpdateTemplateInput = {
  templateId: string;
  name: string;
  isDefault: boolean;
};

export type AddTemplateOutflowInput = {
  templateId: string;
  label: string;
  amount: number;
};

export type AddTemplateBudgetInput = {
  templateId: string;
  name: string;
  initialBalance: number;
};

export type UpdateTemplateOutflowInput = {
  templateId: string;
  outflowId: string;
  label: string;
  amount: number;
};

export type UpdateTemplateBudgetInput = {
  templateId: string;
  budgetId: string;
  name: string;
  initialBalance: number;
};

export interface TemplateService {
  getDefaultForNewMonth(): Promise<DefaultNewMonthBundle>;
  getAllTemplates(): Promise<TemplateView[]>;
  updateTemplate(input: UpdateTemplateInput): Promise<TemplateView>;
  addTemplateOutflow(input: AddTemplateOutflowInput): Promise<TemplateView>;
  deleteTemplateOutflow(input: { templateId: string; outflowId: string }): Promise<TemplateView>;
  addTemplateBudget(input: AddTemplateBudgetInput): Promise<TemplateView>;
  deleteTemplateBudget(input: { templateId: string; budgetId: string }): Promise<TemplateView>;
  updateTemplateOutflow(input: UpdateTemplateOutflowInput): Promise<TemplateView>;
  updateTemplateBudget(input: UpdateTemplateBudgetInput): Promise<TemplateView>;
}
