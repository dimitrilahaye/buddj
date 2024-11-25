import { TestBed } from '@angular/core/testing';

import { YearlyOutflowsService } from './yearly-outflows.service';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('YearlyOutflowsService', () => {
  let service: YearlyOutflowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: YEARLY_OUTFLOWS_STORE,
          useValue: {
            replaceAll: () => null,
          },
        },
      ],
    });
    service = TestBed.inject(YearlyOutflowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
