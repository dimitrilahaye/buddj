import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTemplateComponent } from './monthly-template.component';

describe('MonthlyTemplateComponent', () => {
  let component: MonthlyTemplateComponent;
  let fixture: ComponentFixture<MonthlyTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
