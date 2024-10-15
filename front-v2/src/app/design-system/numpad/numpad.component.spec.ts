import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumpadComponent } from './numpad.component';
import { DesignSystemModule } from '../design-system.module';

describe('NumpadComponent', () => {
  let component: NumpadComponent;
  let fixture: ComponentFixture<NumpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumpadComponent],
      imports: [DesignSystemModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NumpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
