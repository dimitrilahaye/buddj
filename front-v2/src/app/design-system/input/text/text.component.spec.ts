/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import { TextComponent } from './text.component';
import { DesignSystemModule } from '../../design-system.module';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;
  let controlContainer: FormGroupDirective;

  beforeEach(async () => {
    const formGroupMock = new FormGroup({
      label: new FormControl(null),
    });

    controlContainer = new FormGroupDirective([], []);
    controlContainer.form = formGroupMock;

    await TestBed.configureTestingModule({
      declarations: [TextComponent],
      imports: [DesignSystemModule],
      providers: [
        {
          provide: ControlContainer,
          useValue: controlContainer,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;

    (component as any).formControlName = () => 'label';

    (component as any).controlContainer = controlContainer;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.controlContainer).toBeTruthy();
  });
});
