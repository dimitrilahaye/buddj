import { Injectable } from '@angular/core';
import { ProjectStore } from './projects.store';

@Injectable({
  providedIn: 'root',
})
export class SavingStore extends ProjectStore {}
