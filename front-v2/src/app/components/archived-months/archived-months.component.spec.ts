import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedMonthsComponent } from './archived-months.component';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';
import { signal } from '@angular/core';

describe('ArchivedMonthsComponent', () => {
  let component: ArchivedMonthsComponent;
  let fixture: ComponentFixture<ArchivedMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivedMonthsComponent],
      providers: [
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getAllArchivedMonths: () => signal([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivedMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
