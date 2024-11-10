import { InjectionToken } from '@angular/core';

export default interface ToasterServiceInterface {
  success(message: string): void;
  error(message: string): void;
}

export const TOASTER_SERVICE = new InjectionToken<ToasterServiceInterface>(
  'TOASTER_SERVICE'
);
