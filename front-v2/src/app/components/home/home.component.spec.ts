import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';
import { signal } from '@angular/core';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getAll: () => signal([]),
            getCurrentOutflows: () => signal([]),
          },
        },
        {
          provide: MONTHS_SERVICE,
          useValue: {
            getUnarchivedMonths: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
