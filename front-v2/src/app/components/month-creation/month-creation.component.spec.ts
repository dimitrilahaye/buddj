import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCreationComponent } from './month-creation.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('MonthCreationComponent', () => {
  let component: MonthCreationComponent;
  let fixture: ComponentFixture<MonthCreationComponent>;

  const activatedRouteStub = {
    data: of({
      template: {},
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthCreationComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
