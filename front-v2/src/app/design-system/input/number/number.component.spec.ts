/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import { NumberComponent } from './number.component';
import { DesignSystemModule } from '../../design-system.module';

describe('NumberComponent', () => {
  let component: NumberComponent;
  let fixture: ComponentFixture<NumberComponent>;
  let controlContainer: FormGroupDirective;

  beforeEach(async () => {
    const formGroupMock = new FormGroup({
      startingBalance: new FormControl(null),
    });

    controlContainer = new FormGroupDirective([], []);
    controlContainer.form = formGroupMock;

    await TestBed.configureTestingModule({
      declarations: [NumberComponent],
      imports: [DesignSystemModule],
      providers: [
        {
          provide: ControlContainer,
          useValue: controlContainer,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberComponent);
    component = fixture.componentInstance;

    (component as any).formControlName = () => 'startingBalance';

    (component as any).controlContainer = controlContainer;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.controlContainer).toBeTruthy();
  });
});
