/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { MonthCreationTemplate } from '../../models/monthTemplate.model';
import { inject } from '@angular/core';
import { MONTH_TEMPLATES_SERVICE } from '../../services/monthTemplates/monthTemplates.service.interface';

export const monthTemplateResolver: ResolveFn<MonthCreationTemplate> = (
  route,
  state
) => {
  const monthTemplatesService = inject(MONTH_TEMPLATES_SERVICE);
  return monthTemplatesService.getTemplate();
};
