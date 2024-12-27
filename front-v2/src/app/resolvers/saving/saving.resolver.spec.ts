import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { savingResolver } from './saving.resolver';
import { PROJECTS_SERVICE } from '../../services/projects/projects.service.interface';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';

describe('savingResolver', () => {
  const executeResolver: ResolveFn<void> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => savingResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PROJECTS_SERVICE, PROJECT_STORE],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
