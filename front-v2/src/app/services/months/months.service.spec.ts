import { TestBed } from '@angular/core/testing';

import { MonthsService } from './months.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';

describe('MonthsService', () => {
  let service: MonthsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            addMonth: () => null,
          },
        },
      ],
    });
    service = TestBed.inject(MonthsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
