import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferChoiceComponent } from './transfer-choice.component';
import { CurrencyPipe } from '@angular/common';
import { MONTHLY_BUDGETS_STORE } from '../../../stores/monthlyBudgets/monthlyBudgets.store.interface';
import { signal } from '@angular/core';

describe('TransferChoiceComponent', () => {
  let component: TransferChoiceComponent;
  let fixture: ComponentFixture<TransferChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferChoiceComponent],
      providers: [
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            getCurrent: () => signal(null),
          },
        },
        CurrencyPipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
