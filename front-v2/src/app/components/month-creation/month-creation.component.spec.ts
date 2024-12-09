import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCreationComponent } from './month-creation.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';

describe('MonthCreationComponent', () => {
  let component: MonthCreationComponent;
  let fixture: ComponentFixture<MonthCreationComponent>;

  const activatedRouteStub = {
    data: of({
      template: {
        template: {
          month: new Date(),
          outflows: [],
          budgets: [],
        },
        pendingDebits: [],
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthCreationComponent, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MONTHS_SERVICE, useValue: {} },
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {},
        },
        {
          provide: YEARLY_OUTFLOWS_STORE,
          useValue: {},
        },
        {
          provide: TOASTER_SERVICE,
          useValue: {},
        },
        Router,
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
