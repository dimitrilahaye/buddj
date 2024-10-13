/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { MonthlyBudget } from '../../models/monthlyBudget.model';

export const archivedMonthsResolver: ResolveFn<MonthlyBudget[]> = (
  route,
  state
) => {
  const monthsService = inject(MONTHS_SERVICE);
  return monthsService.getArchivedMonths();
};
