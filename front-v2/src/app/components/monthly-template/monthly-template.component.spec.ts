import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTemplateComponent } from './monthly-template.component';
import { ActivatedRoute } from '@angular/router';
import { MONTHLY_TEMPLATES_STORE } from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';
import { signal } from '@angular/core';
import { MONTH_TEMPLATES_SERVICE } from '../../services/monthTemplates/monthTemplates.service.interface';
import { of } from 'rxjs';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';

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
          provide: TOASTER_SERVICE,
          useValue: {},
        },
        {
          provide: MONTHLY_TEMPLATES_STORE,
          useValue: {
            getById: () => signal(null),
          },
        },
        {
          provide: MONTH_TEMPLATES_SERVICE,
          useValue: {
            updateTemplate: () => of(),
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
