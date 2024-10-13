import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedMonthsComponent } from './archived-months.component';

describe('ArchivedMonthsComponent', () => {
  let component: ArchivedMonthsComponent;
  let fixture: ComponentFixture<ArchivedMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivedMonthsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivedMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
