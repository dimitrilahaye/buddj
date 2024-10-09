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

@NgModule({
  declarations: [
    ButtonComponent,
    NumberComponent,
    MonthComponent,
    TextComponent,
    SlidingModalComponent,
    ItemComponent,
    DividerComponent,
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
  ],
})
export class DesignSystemModule {}
