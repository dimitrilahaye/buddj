import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { yearlyOutflowsResolver } from './yearly-outflows.resolver';
import { YEARLY_OUTFLOWS_SERVICE } from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';

describe('yearlyOutflowsResolver', () => {
  const executeResolver: ResolveFn<void> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      yearlyOutflowsResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YEARLY_OUTFLOWS_SERVICE, YEARLY_OUTFLOWS_STORE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
