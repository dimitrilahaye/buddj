import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';

export type DeleteTemplateOutflowUseCase = (input: {
  templateId: string;
  outflowId: string;
}) => Promise<TemplateView>;

export function createDeleteTemplateOutflow({
  templateService,
}: {
  templateService: TemplateService;
}): DeleteTemplateOutflowUseCase {
  return (input) => templateService.deleteTemplateOutflow(input);
}
