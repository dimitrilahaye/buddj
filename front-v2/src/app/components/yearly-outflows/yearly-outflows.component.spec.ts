import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyOutflowsComponent } from './yearly-outflows.component';
import { YEARLY_OUTFLOWS_STORE } from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import { signal } from '@angular/core';

describe('YearlyOutflowsComponent', () => {
  let component: YearlyOutflowsComponent;
  let fixture: ComponentFixture<YearlyOutflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyOutflowsComponent],
      providers: [
        {
          provide: YEARLY_OUTFLOWS_STORE,
          useValue: {
            getAll: () => signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearlyOutflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
