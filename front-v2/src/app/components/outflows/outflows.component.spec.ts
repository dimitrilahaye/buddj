import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutflowsComponent } from './outflows.component';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { signal } from '@angular/core';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';

describe('OutflowsComponent', () => {
  let component: OutflowsComponent;
  let fixture: ComponentFixture<OutflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutflowsComponent],
      providers: [
        { provide: MONTHS_SERVICE, useValue: {} },
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getCurrent: () =>
              signal({ dashboard: { account: { currentBalance: 2000 } } }),
            getCurrentOutflows: () => signal([]),
            askedForNewOutflow: () => signal(0),
          },
        },
        {
          provide: TOASTER_SERVICE,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OutflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
