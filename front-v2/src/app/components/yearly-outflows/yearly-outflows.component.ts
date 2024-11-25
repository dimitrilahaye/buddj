import { Component, Inject, Signal } from '@angular/core';
import {
  YEARLY_OUTFLOWS_STORE,
  YearlyOutflowsStoreInterface,
} from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import { YearlyOutflows } from '../../models/yearlyOutflow.model';
import { CommonModule } from '@angular/common';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-yearly-outflows',
  standalone: true,
  imports: [DesignSystemModule, CommonModule],
  templateUrl: './yearly-outflows.component.html',
  styleUrl: './yearly-outflows.component.scss',
})
export class YearlyOutflowsComponent {
  outflows: Signal<YearlyOutflows | null>;

  constructor(
    private router: Router,
    @Inject(YEARLY_OUTFLOWS_STORE)
    private readonly yearlyOutflowsStore: YearlyOutflowsStoreInterface
  ) {
    this.outflows = this.yearlyOutflowsStore.getAll();
  }

  getOutflowsForMonth(month: number) {
    return this.outflows()![month];
  }

  backToHome() {
    this.router.navigate(['home']);
  }
}
