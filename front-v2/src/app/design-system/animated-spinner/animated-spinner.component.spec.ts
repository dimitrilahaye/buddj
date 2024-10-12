import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedSpinnerComponent } from './animated-spinner.component';
import { DesignSystemModule } from '../design-system.module';

describe('AnimatedSpinnerComponent', () => {
  let component: AnimatedSpinnerComponent;
  let fixture: ComponentFixture<AnimatedSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimatedSpinnerComponent],
      imports: [DesignSystemModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
