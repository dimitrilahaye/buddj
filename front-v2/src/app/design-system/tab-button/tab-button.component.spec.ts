import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabButtonComponent } from './tab-button.component';
import { DesignSystemModule } from '../design-system.module';

describe('TabButtonComponent', () => {
  let component: TabButtonComponent;
  let fixture: ComponentFixture<TabButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabButtonComponent],
      imports: [DesignSystemModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TabButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
