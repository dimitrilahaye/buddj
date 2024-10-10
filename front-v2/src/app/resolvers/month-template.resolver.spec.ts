import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { monthTemplateResolver } from './month-template.resolver';
import { MONTH_TEMPLATES_SERVICE } from '../services/monthTemplates/monthTemplates.service.interface';
import { MonthTemplate } from '../models/monthTemplate.model';

describe('monthTemplateResolver', () => {
  const executeResolver: ResolveFn<MonthTemplate> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      monthTemplateResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MONTH_TEMPLATES_SERVICE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
