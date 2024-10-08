import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCreationComponent } from './month-creation.component';

describe('MonthCreationComponent', () => {
  let component: MonthCreationComponent;
  let fixture: ComponentFixture<MonthCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
