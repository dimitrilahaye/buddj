import { TestBed } from '@angular/core/testing';

import { MonthTemplatesService } from './monthTemplates.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('MonthTemplatesService', () => {
  let service: MonthTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler],
    });
    service = TestBed.inject(MonthTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
