/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { YEARLY_OUTFLOWS_SERVICE } from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';

export const yearlyOutflowsResolver: ResolveFn<void> = (_route, _state) => {
  const yearlyOutflowsService = inject(YEARLY_OUTFLOWS_SERVICE);
  const yearlyOutflowsStore = inject(YEARLY_OUTFLOWS_STORE);
  if (yearlyOutflowsStore.getAll()() === null) {
    return yearlyOutflowsService.getAll();
  }
  return void 0;
};
