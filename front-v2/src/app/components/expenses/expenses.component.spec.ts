import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesComponent } from './expenses.component';
import { signal } from '@angular/core';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesComponent],
      providers: [
        { provide: MONTHS_SERVICE, useValue: {} },
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getCurrent: () =>
              signal({
                account: { weeklyBudgets: [] },
                dashboard: {
                  account: { currentBalance: 2000 },
                },
              }),
            getCurrentExpenses: () => signal([]),
            askedForNewExpense: () => signal(0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
