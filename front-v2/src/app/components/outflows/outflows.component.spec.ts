import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutflowsComponent } from './outflows.component';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';
import { signal } from '@angular/core';

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
            getCurrent: () => signal(null),
            getCurrentOutflows: () => signal([]),
          },
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
