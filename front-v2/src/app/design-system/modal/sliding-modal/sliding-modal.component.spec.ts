import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingModalComponent } from './sliding-modal.component';

describe('SlidingModalComponent', () => {
  let component: SlidingModalComponent;
  let fixture: ComponentFixture<SlidingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlidingModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlidingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
