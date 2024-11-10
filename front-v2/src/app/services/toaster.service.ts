import { Inject, Injectable } from '@angular/core';
import ToasterServiceInterface from './toaster.service.interface';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class ToasterService implements ToasterServiceInterface {
  constructor(@Inject(HotToastService) private toaster: HotToastService) {}

  success(message: string): void {
    this.toaster.success(message);
  }
  error(message: string): void {
    this.toaster.error(message);
  }
}
