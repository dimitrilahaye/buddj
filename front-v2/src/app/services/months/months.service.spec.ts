import { TestBed } from '@angular/core/testing';

import { MonthsService } from './months.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('MonthsService', () => {
  let service: MonthsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler],
    });
    service = TestBed.inject(MonthsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
