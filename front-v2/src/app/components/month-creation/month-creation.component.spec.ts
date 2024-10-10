import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCreationComponent } from './month-creation.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MONTHS_SERVICE_SERVICE } from '../../services/months/months.service.interface';
import { Renderer2 } from '@angular/core';

describe('MonthCreationComponent', () => {
  let component: MonthCreationComponent;
  let fixture: ComponentFixture<MonthCreationComponent>;

  const activatedRouteStub = {
    data: of({
      template: {
        month: new Date(),
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthCreationComponent, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MONTHS_SERVICE_SERVICE, useValue: {} },
        Router,
        FormBuilder,
        Renderer2,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
