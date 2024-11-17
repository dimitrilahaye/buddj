import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleVisibilityButtonComponent } from './toggle-visibility-button.component';

describe('ToggleVisibilityButtonComponent', () => {
  let component: ToggleVisibilityButtonComponent;
  let fixture: ComponentFixture<ToggleVisibilityButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleVisibilityButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleVisibilityButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
