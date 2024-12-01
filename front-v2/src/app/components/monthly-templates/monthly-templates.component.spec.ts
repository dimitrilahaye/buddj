import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTemplatesComponent } from './monthly-templates.component';

describe('MonthlyTemplatesComponent', () => {
  let component: MonthlyTemplatesComponent;
  let fixture: ComponentFixture<MonthlyTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
