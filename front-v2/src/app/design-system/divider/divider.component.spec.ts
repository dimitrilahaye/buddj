import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerComponent } from './divider.component';
import { DesignSystemModule } from '../design-system.module';

describe('DividerComponent', () => {
  let component: DividerComponent;
  let fixture: ComponentFixture<DividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DividerComponent],
      imports: [DesignSystemModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
