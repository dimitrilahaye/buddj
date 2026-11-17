import type { UpdateTemplateBudgetInput, TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';

export type UpdateTemplateBudgetUseCase = (input: UpdateTemplateBudgetInput) => Promise<TemplateView>;

export function createUpdateTemplateBudget({
  templateService,
}: {
  templateService: TemplateService;
}): UpdateTemplateBudgetUseCase {
  return (input) => templateService.updateTemplateBudget(input);
}
