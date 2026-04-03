import type { TemplateService } from './template-service.js';
import type { TemplateView } from './template-view.js';

export type LoadTemplatesUseCase = () => Promise<TemplateView[]>;

export function createLoadTemplates({ templateService }: { templateService: TemplateService }): LoadTemplatesUseCase {
  return () => templateService.getAllTemplates();
}
