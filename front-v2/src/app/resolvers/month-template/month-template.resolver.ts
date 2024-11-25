/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { MonthCreationTemplate } from '../../models/monthTemplate.model';
import { inject } from '@angular/core';
import { MONTH_TEMPLATES_SERVICE } from '../../services/monthTemplates/monthTemplates.service.interface';
import { YEARLY_OUTFLOWS_SERVICE } from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';

export const monthTemplateResolver: ResolveFn<MonthCreationTemplate> = (
  route,
  state
) => {
  const monthTemplatesService = inject(MONTH_TEMPLATES_SERVICE);
  const yearlyOutflowsService = inject(YEARLY_OUTFLOWS_SERVICE);
  const yearlyOutflowsStore = inject(YEARLY_OUTFLOWS_STORE);
  if (yearlyOutflowsStore.getAll()() === null) {
    yearlyOutflowsService.getAll().subscribe();
  }
  return monthTemplatesService.getTemplate();
};
