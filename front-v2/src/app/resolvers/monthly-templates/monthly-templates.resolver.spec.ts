import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { monthlyTemplatesResolver } from './monthly-templates.resolver';
import { MONTH_TEMPLATES_SERVICE } from '../../services/monthTemplates/monthTemplates.service.interface';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';

describe('monthlyTemplatesResolver', () => {
  const executeResolver: ResolveFn<void> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      monthlyTemplatesResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MONTH_TEMPLATES_SERVICE, MONTHLY_TEMPLATES_STORE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
