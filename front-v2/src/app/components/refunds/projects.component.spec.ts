import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PROJECT_STORE } from '../../stores/projects/projects.store.interface';
import { ProjectStore } from '../../stores/projects/projects.store';
import { PROJECTS_SERVICE } from '../../services/projects/projects.service.interface';
import { TOASTER_SERVICE } from '../../services/toaster/toaster.service.interface';
import { ToasterService } from '../../services/toaster/toaster.service';
import { CONFETTI_SERVICE } from '../../services/confetti/confetti.service.interface';
import { ConfettiService } from '../../services/confetti/confetti.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  const activatedRouteStub = {
    snapshot: {
      queryParamMap: {
        get: jasmine.createSpy(),
      },
    },
  };
  const projectServiceStub = {
    create: jasmine.createSpy(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        Router,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PROJECT_STORE, useClass: ProjectStore },
        { provide: PROJECTS_SERVICE, useValue: projectServiceStub },
        { provide: TOASTER_SERVICE, useClass: ToasterService },
        { provide: CONFETTI_SERVICE, useClass: ConfettiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
