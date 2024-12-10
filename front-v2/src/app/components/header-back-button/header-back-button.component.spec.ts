import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBackButtonComponent } from './header-back-button.component';

describe('HeaderBackToHomeComponent', () => {
  let component: HeaderBackButtonComponent;
  let fixture: ComponentFixture<HeaderBackButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBackButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderBackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
