import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTemplateComponent } from './monthly-template.component';
import { ActivatedRoute } from '@angular/router';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';
import { signal } from '@angular/core';

describe('MonthlyTemplateComponent', () => {
  let component: MonthlyTemplateComponent;
  let fixture: ComponentFixture<MonthlyTemplateComponent>;
  const activatedRouteStub = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy(),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTemplateComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        {
          provide: MONTHLY_TEMPLATES_STORE,
          useValue: {
            getById: () => signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
