import { Injectable } from '@angular/core';
import ConfettiServiceInterface from './confetti.service.interface';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService implements ConfettiServiceInterface {
  launch(): void {
    const duration = 50;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: Math.random() - 0.2 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}
