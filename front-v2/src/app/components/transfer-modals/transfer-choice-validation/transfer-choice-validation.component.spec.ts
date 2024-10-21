import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferChoiceValidationComponent } from './transfer-choice-validation.component';
import { signal } from '@angular/core';
import { MONTHLY_BUDGETS_STORE } from '../../../stores/monthlyBudgets.store.interface';

describe('TransferChoiceValidationComponent', () => {
  let component: TransferChoiceValidationComponent;
  let fixture: ComponentFixture<TransferChoiceValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferChoiceValidationComponent],
      providers: [
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getCurrent: () => signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferChoiceValidationComponent);
    component = fixture.componentInstance;
    component.fromValidationAccount = {
      id: 'id',
      currentBalance: 200,
      outflows: [],
      weeklyBudgets: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
