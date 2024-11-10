import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedMonthsComponent } from './archived-months.component';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';
import { signal } from '@angular/core';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { of } from 'rxjs';
import { TOASTER_SERVICE } from '../../services/toaster.service.interface';

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
        {
          provide: MONTHS_SERVICE,
          useValue: {
            unarchiveMonth: () => of(),
          },
        },
        {
          provide: TOASTER_SERVICE,
          useValue: {},
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
