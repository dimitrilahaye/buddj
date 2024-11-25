import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { signal } from '@angular/core';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AUTHENTICATION_SERVICE } from '../../services/authentication/authentication.service.interface';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getCurrent: () => signal(null),
            getAll: () => signal([]),
            getCurrentOutflows: () => signal([]),
            isCurrentMonthTheFirst: () => signal(true),
            isCurrentMonthTheLast: () => signal(false),
          },
        },
        {
          provide: AUTHENTICATION_SERVICE,
          useValue: {
            logout: () => of(),
          },
        },
        {
          provide: MONTHS_SERVICE,
          useValue: {
            getUnarchivedMonths: () => of([]),
          },
        },
        {
          provide: TOASTER_SERVICE,
          useValue: {},
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
