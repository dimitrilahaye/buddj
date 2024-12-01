/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MONTH_TEMPLATES_SERVICE } from '../../services/monthTemplates/monthTemplates.service.interface';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';

export const monthlyTemplatesResolver: ResolveFn<void> = (_route, _state) => {
  const monthlyTemplatesService = inject(MONTH_TEMPLATES_SERVICE);
  const monthlyTemplatesStore = inject(MONTHLY_TEMPLATES_STORE);
  if (monthlyTemplatesStore.getAll()().length === 0) {
    return monthlyTemplatesService.getAll();
  }
  return void 0;
};
