import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTemplatesComponent } from './monthly-templates.component';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';
import { signal } from '@angular/core';

describe('MonthlyTemplatesComponent', () => {
  let component: MonthlyTemplatesComponent;
  let fixture: ComponentFixture<MonthlyTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTemplatesComponent],
      providers: [
        {
          provide: MONTHLY_TEMPLATES_STORE,
          useValue: {
            getAll: () => signal([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
