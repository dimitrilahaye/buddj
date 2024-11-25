import { Component, Inject, Signal } from '@angular/core';
import {
  YEARLY_OUTFLOWS_STORE,
  YearlyOutflowsStoreInterface,
} from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';
import {
  YearlyOutflow,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';
import { CommonModule } from '@angular/common';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { Router } from '@angular/router';
import YearlyOutflowsServiceInterface, {
  YEARLY_OUTFLOWS_SERVICE,
} from '../../services/yearlyOutflows/yearly-outflows.service.interface';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';

@Component({
  selector: 'app-yearly-outflows',
  standalone: true,
  imports: [DesignSystemModule, CommonModule],
  templateUrl: './yearly-outflows.component.html',
  styleUrl: './yearly-outflows.component.scss',
})
export class YearlyOutflowsComponent {
  outflows: Signal<YearlyOutflows | null>;
  removeIsLoading = false;
  outflowDelationModalIsOpen = false;
  outflowToDelete: YearlyOutflow | null = null;

  constructor(
    private readonly router: Router,
    @Inject(YEARLY_OUTFLOWS_STORE)
    private readonly yearlyOutflowsStore: YearlyOutflowsStoreInterface,
    @Inject(YEARLY_OUTFLOWS_SERVICE)
    private readonly yearlyOutflowsService: YearlyOutflowsServiceInterface,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface
  ) {
    this.outflows = this.yearlyOutflowsStore.getAll();
  }

  getOutflowsForMonth(month: number) {
    return this.outflows()![month];
  }

  openOutflowDelationModal(outflow: YearlyOutflow, event: Event) {
    this.outflowDelationModalIsOpen = true;
    this.outflowToDelete = outflow;
    event.stopPropagation();
  }

  closeOutflowDelationModal(event: Event) {
    this.outflowDelationModalIsOpen = false;
    this.outflowToDelete = null;
    event.stopPropagation();
  }

  removeOutflow(event: Event) {
    this.removeIsLoading = true;
    event.stopPropagation();
    this.yearlyOutflowsService
      .remove(this.outflowToDelete!.id)
      .pipe(
        finalize(() => {
          this.removeIsLoading = false;
          this.outflowDelationModalIsOpen = false;
        })
      )
      .subscribe(() => {
        this.toaster.success('La sortie annuelle ont été supprimée !');
      });
  }

  backToHome() {
    this.router.navigate(['home']);
  }
}
