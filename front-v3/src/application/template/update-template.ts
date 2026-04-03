import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';
import type { UpdateTemplateInput } from './template-service.js';

export type UpdateTemplateUseCase = (input: UpdateTemplateInput) => Promise<TemplateView>;

export function createUpdateTemplate({ templateService }: { templateService: TemplateService }): UpdateTemplateUseCase {
  return (input) => templateService.updateTemplate(input);
}
