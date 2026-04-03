import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';

export type DeleteTemplateBudgetUseCase = (input: {
  templateId: string;
  budgetId: string;
}) => Promise<TemplateView>;

export function createDeleteTemplateBudget({
  templateService,
}: {
  templateService: TemplateService;
}): DeleteTemplateBudgetUseCase {
  return (input) => templateService.deleteTemplateBudget(input);
}
