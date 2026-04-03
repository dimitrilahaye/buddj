import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';
import type { AddTemplateBudgetInput } from './template-service.js';

export type AddTemplateBudgetUseCase = (input: AddTemplateBudgetInput) => Promise<TemplateView>;

export function createAddTemplateBudget({
  templateService,
}: {
  templateService: TemplateService;
}): AddTemplateBudgetUseCase {
  return (input) => templateService.addTemplateBudget(input);
}
