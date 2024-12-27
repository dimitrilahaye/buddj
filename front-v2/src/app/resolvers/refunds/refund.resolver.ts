/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PROJECTS_SERVICE } from '../../services/projects/projects.service.interface';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';

export const refundResolver: ResolveFn<void> = (route, state) => {
  const service = inject(PROJECTS_SERVICE);
  const store = inject(PROJECT_STORE);
  if (store.getAllByCategory('refund')() === null) {
    service.getAllByCategory('refund').subscribe();
  }
};
