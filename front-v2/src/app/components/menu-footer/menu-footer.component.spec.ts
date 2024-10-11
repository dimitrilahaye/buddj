import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFooterComponent } from './menu-footer.component';
import { MONTHLY_BUDGETS_STORE } from '../../stores/monthlyBudgets.store.interface';

describe('MenuFooterComponent', () => {
  let component: MenuFooterComponent;
  let fixture: ComponentFixture<MenuFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuFooterComponent],
      providers: [
        {
          provide: MONTHLY_BUDGETS_STORE,
          useValue: {
            askForNewOutflow: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
