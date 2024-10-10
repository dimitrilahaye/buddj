/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import { MonthComponent } from './month.component';
import { DesignSystemModule } from '../../design-system.module';

describe('MonthComponent', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;
  let controlContainer: FormGroupDirective;

  beforeEach(async () => {
    const formGroupMock = new FormGroup({
      month: new FormControl(null),
    });

    controlContainer = new FormGroupDirective([], []);
    controlContainer.form = formGroupMock;

    await TestBed.configureTestingModule({
      declarations: [MonthComponent],
      imports: [DesignSystemModule],
      providers: [
        {
          provide: ControlContainer,
          useValue: controlContainer,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;

    (component as any).formControlName = () => 'month';

    (component as any).controlContainer = controlContainer;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.controlContainer).toBeTruthy();
  });
});
