import { TestBed } from '@angular/core/testing';

import { ProjectsService } from './projects.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: PROJECT_STORE,
          useValue: {
            replace: () => void 0,
            remove: () => void 0,
            add: () => void 0,
            addAll: () => void 0,
          },
        },
      ],
    });
    service = TestBed.inject(ProjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
