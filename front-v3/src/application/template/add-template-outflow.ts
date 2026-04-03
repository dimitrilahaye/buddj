import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';
import type { AddTemplateOutflowInput } from './template-service.js';

export type AddTemplateOutflowUseCase = (input: AddTemplateOutflowInput) => Promise<TemplateView>;

export function createAddTemplateOutflow({
  templateService,
}: {
  templateService: TemplateService;
}): AddTemplateOutflowUseCase {
  return (input) => templateService.addTemplateOutflow(input);
}
