import { InjectionToken } from '@angular/core';

export default interface ConfettiServiceInterface {
  launch(): void;
}

export const CONFETTI_SERVICE = new InjectionToken<ConfettiServiceInterface>(
  'CONFETTI_SERVICE'
);
