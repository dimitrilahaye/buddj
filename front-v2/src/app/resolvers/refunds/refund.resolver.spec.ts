import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { refundResolver } from './refund.resolver';
import { PROJECTS_SERVICE } from '../../services/projects/projects.service.interface';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';

describe('refundResolver', () => {
  const executeResolver: ResolveFn<void> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => refundResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PROJECTS_SERVICE, PROJECT_STORE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
