import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyOutflowsComponent } from './yearly-outflows.component';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import { signal } from '@angular/core';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';
import { YEARLY_OUTFLOWS_SERVICE } from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { of } from 'rxjs';
import { ToasterService } from '../../services/toaster/toaster.service';

describe('YearlyOutflowsComponent', () => {
  let component: YearlyOutflowsComponent;
  let fixture: ComponentFixture<YearlyOutflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyOutflowsComponent],
      providers: [
        {
          provide: YEARLY_OUTFLOWS_STORE,
          useValue: {
            getAll: () =>
              signal({
                1: {
                  budgets: [],
                  outflows: [],
                },
                2: {
                  budgets: [],
                  outflows: [],
                },
                3: {
                  budgets: [],
                  outflows: [],
                },
                4: {
                  budgets: [],
                  outflows: [],
                },
                5: {
                  budgets: [],
                  outflows: [],
                },
                6: {
                  budgets: [],
                  outflows: [],
                },
                7: {
                  budgets: [],
                  outflows: [],
                },
                8: {
                  budgets: [],
                  outflows: [],
                },
                9: {
                  budgets: [],
                  outflows: [],
                },
                10: {
                  budgets: [],
                  outflows: [],
                },
                11: {
                  budgets: [],
                  outflows: [],
                },
                12: {
                  budgets: [],
                  outflows: [],
                },
              }),
          },
        },
        {
          provide: YEARLY_OUTFLOWS_SERVICE,
          useValue: {
            remove: () => of(),
          },
        },
        {
          provide: TOASTER_SERVICE,
          useClass: ToasterService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearlyOutflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
