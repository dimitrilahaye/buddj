/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import {
  Category,
  PROJECTS_SERVICE,
} from '../../services/projects/projects.service.interface';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';

export const projectResolver: ResolveFn<void> = (route, state) => {
  const service = inject(PROJECTS_SERVICE);
  const store = inject(PROJECT_STORE);

  const queryParams = route.queryParamMap;
  const category = queryParams.get('category');
  if (category === null) {
    return;
  }
  if (store.getAllByCategory(category as Category)() === null) {
    service.getAllByCategory(category as Category).subscribe();
  }
};
