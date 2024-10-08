/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { MonthTemplate } from '../models/monthTemplate.model';
import { inject } from '@angular/core';
import { MONTH_TEMPLATES_SERVICE_SERVICE } from '../services/monthTemplates/monthTemplates.service.interface';

export const monthTemplateResolver: ResolveFn<MonthTemplate> = (
  route,
  state
) => {
  const monthTemplatesService = inject(MONTH_TEMPLATES_SERVICE_SERVICE);
  return monthTemplatesService.getTemplate();
};
