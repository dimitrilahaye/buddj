import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AUTHENTICATION_SERVICE } from '../../services/authentication/authentication.service.interface';
import { MONTHS_SERVICE } from '../../services/months/months.service.interface';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets/monthlyBudgets.store.interface';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
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

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
