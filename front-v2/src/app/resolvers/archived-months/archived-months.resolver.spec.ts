import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { archivedMonthsResolver } from './archived-months.resolver';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';

describe('archivedMonthsResolver', () => {
  const executeResolver: ResolveFn<MonthlyBudget[]> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      archivedMonthsResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MONTHS_SERVICE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
