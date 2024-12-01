import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBackToHomeComponent } from './header-back-to-home.component';

describe('HeaderBackToHomeComponent', () => {
  let component: HeaderBackToHomeComponent;
  let fixture: ComponentFixture<HeaderBackToHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBackToHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderBackToHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
