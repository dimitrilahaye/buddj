import {
  Component,
  Inject,
  model,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import ProjectsServiceInterface, {
  Category,
  CreateCommand,
  PROJECTS_SERVICE,
} from '../../services/projects/projects.service.interface';
import { ActivatedRoute, Router } from '@angular/router';
import ProjectStoreInterface, {
  PROJECT_STORE,
} from '../../stores/projects/projects.store.interface';
import { Project } from '../../models/project.model';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { finalize } from 'rxjs';
import ToasterServiceInterface, {
  TOASTER_SERVICE,
} from '../../services/toaster/toaster.service.interface';
import { CommonModule } from '@angular/common';

type SlidingModal = 'creation' | 'update' | 'numpad';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, HeaderBackButtonComponent, DesignSystemModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  category: Category | undefined;
  projects: Signal<Project[] | null> = signal(null);
  openSlidingModals: Set<SlidingModal> = new Set<SlidingModal>();
  creatingProject = model<CreateCommand | null>(null);
  isLoading = false;
  updatingProject = model<Project | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(PROJECT_STORE) private readonly store: ProjectStoreInterface,
    @Inject(PROJECTS_SERVICE)
    private readonly service: ProjectsServiceInterface,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface
  ) {}

  ngOnInit(): void {
    const category = this.route.snapshot.queryParamMap.get('category');
    if (category === null || !['refund', 'saving'].includes(category)) {
      this.router.navigate(['/']);
    }
    this.category = category as Category;

    this.projects = this.store.getAllByCategory(this.category);
  }

  hasProjects() {
    return this.projects() !== null && this.projects()!.length > 0;
  }

  get tipsLabel() {
    return this.category === 'refund'
      ? "Vous n'avez pas encore crée de remboursement 🙂"
      : "Vous n'avez pas encore crée d'économie 🙂";
  }

  get tipsImage() {
    return this.category === 'refund'
      ? 'info/no-refund-yet.png'
      : 'info/no-saving-yet.png';
  }

  get createButtonLabel() {
    return this.category === 'refund'
      ? 'Ajouter ce remboursement'
      : 'Ajouter cette économie';
  }

  get updateButtonLabel() {
    return this.category === 'refund'
      ? 'Modifier ce remboursement'
      : 'Modifier cette économie';
  }

  get toasterCreationMessage() {
    return this.category === 'refund'
      ? 'Votre remboursement a été crée !'
      : 'Votre économie a été crée !';
  }

  get toasterUpdateMessage() {
    return this.category === 'refund'
      ? 'Votre remboursement a bien été modifié !'
      : 'Votre économie a bien été modifié !';
  }

  get loaderLabel() {
    return this.category === 'refund'
      ? 'Reste à rembourser :'
      : 'Reste à économiser :';
  }

  closeSlidingModal(event: Event, modal: SlidingModal) {
    event.stopPropagation();
    this.openSlidingModals.delete(modal);
  }

  openSlidingModal(modal: SlidingModal) {
    this.openSlidingModals.add(modal);
  }

  openCreateModal() {
    this.creatingProject.set({
      category: this.category!,
      name: '',
      target: 0,
    });
    this.openSlidingModal('creation');
  }

  openEditModal(project: Project) {
    this.updatingProject.set(project);
    this.openSlidingModal('update');
  }

  slidingModalIsOpen(modal: SlidingModal): boolean {
    return this.openSlidingModals.has(modal);
  }

  updateCreatingProjectName(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.creatingProject.update((project) => {
      if (project === null) {
        return project;
      }
      return {
        ...project,
        name: value,
      };
    });
  }

  updateCreatingProjectTarget(target: string) {
    const value = Number(target.replace(',', '.')).toFixed(2);
    this.creatingProject.update((project) => {
      if (project === null) {
        return project;
      }
      return {
        ...project,
        target: Number(value),
      };
    });
    this.openSlidingModals.delete('numpad');
  }

  updateUpdatingProjectName(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updatingProject.update((project) => {
      if (project === null) {
        return project;
      }
      return {
        ...project,
        name: value,
      };
    });
  }

  updateUpdatingProjectTarget(target: string) {
    const value = Number(target.replace(',', '.')).toFixed(2);
    this.updatingProject.update((project) => {
      if (project === null) {
        return project;
      }
      return {
        ...project,
        target: Number(value),
      };
    });
    this.openSlidingModals.delete('numpad');
  }

  createProject(event: Event) {
    event.stopPropagation();
    if (this.creatingProject() === null) {
      return;
    }
    const { name, target, category } = this.creatingProject()!;
    this.isLoading = true;
    this.service
      .create({ name, target, category })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.closeSlidingModal(event, 'creation');
        })
      )
      .subscribe(() => {
        this.toaster.success(this.toasterCreationMessage);
      });
  }

  updateProject(event: Event) {
    event.stopPropagation();
    if (this.updatingProject() === null) {
      return;
    }
    const { id, name, target } = this.updatingProject()!;
    this.isLoading = true;
    this.service
      .updateProject({ id, name, target })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.closeSlidingModal(event, 'update');
        })
      )
      .subscribe(() => {
        this.toaster.success(this.toasterUpdateMessage);
      });
  }
}
