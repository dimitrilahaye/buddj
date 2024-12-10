import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { NumberComponent } from './input/number/number.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MonthComponent } from './input/month/month.component';
import { SlidingModalComponent } from './modal/sliding-modal/sliding-modal.component';
import { TextComponent } from './input/text/text.component';
import { ItemComponent } from './item/item/item.component';
import { DividerComponent } from './divider/divider.component';
import { LoaderComponent } from './loader/loader.component';
import { AnimatedSpinnerComponent } from './animated-spinner/animated-spinner.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ModalComponent } from './modal/modal/modal.component';
import { InfoComponent } from './info/info.component';
import { NumpadComponent } from './numpad/numpad.component';
import { ButtonIconComponent } from './button-icon/button-icon.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { TipsComponent } from './tips/tips.component';
import { ButtonLinkComponent } from './button-link/button-link.component';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';

@NgModule({
  declarations: [
    ButtonComponent,
    NumberComponent,
    MonthComponent,
    TextComponent,
    SlidingModalComponent,
    ItemComponent,
    DividerComponent,
    LoaderComponent,
    AnimatedSpinnerComponent,
    ProgressBarComponent,
    ModalComponent,
    InfoComponent,
    NumpadComponent,
    ButtonIconComponent,
    ToggleButtonComponent,
    TipsComponent,
    ButtonLinkComponent,
    ScrollToTopComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    ButtonComponent,
    NumberComponent,
    MonthComponent,
    TextComponent,
    SlidingModalComponent,
    ItemComponent,
    DividerComponent,
    LoaderComponent,
    AnimatedSpinnerComponent,
    ProgressBarComponent,
    ModalComponent,
    InfoComponent,
    NumpadComponent,
    ButtonIconComponent,
    ToggleButtonComponent,
    TipsComponent,
    ButtonLinkComponent,
    ScrollToTopComponent,
  ],
})
export class DesignSystemModule {}
