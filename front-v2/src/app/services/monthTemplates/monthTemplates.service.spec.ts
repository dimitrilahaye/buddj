import { TestBed } from '@angular/core/testing';

import { MonthTemplatesService } from './monthTemplates.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';

describe('MonthTemplatesService', () => {
  let service: MonthTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: MONTHLY_TEMPLATES_STORE,
          useValue: {
            addAll: () => null,
          },
        },
      ],
    });
    service = TestBed.inject(MonthTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
