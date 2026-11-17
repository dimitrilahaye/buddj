import type { UpdateTemplateOutflowInput, TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';

export type UpdateTemplateOutflowUseCase = (input: UpdateTemplateOutflowInput) => Promise<TemplateView>;

export function createUpdateTemplateOutflow({
  templateService,
}: {
  templateService: TemplateService;
}): UpdateTemplateOutflowUseCase {
  return (input) => templateService.updateTemplateOutflow(input);
}
