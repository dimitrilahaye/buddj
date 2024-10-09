import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { NumberComponent } from './input/number/number.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MonthComponent } from './input/month/month.component';

@NgModule({
  declarations: [ButtonComponent, NumberComponent, MonthComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [ButtonComponent, NumberComponent, MonthComponent],
})
export class DesignSystemModule {}
