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
import ConfettiServiceInterface, {
  CONFETTI_SERVICE,
} from '../../services/confetti/confetti.service.interface';

type ModalNames =
  | 'creation'
  | 'update'
  | 'add-amount'
  | 'remove'
  | 'numpad-create'
  | 'numpad-update'
  | 'numpad-add-amount';
type LoadingFor = 'rollback' | 'reApply' | 'finish';

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
  openModals = new Set<ModalNames>();
  creatingProject = model<CreateCommand | null>(null);
  isLoading = false;
  loadingFor = new Map<LoadingFor, string>();
  updatingProject = model<Project | null>(null);
  addAmount = model<number>(0);
  projectForAddingAmount: Project | null = null;
  projectToRemove: Project | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(PROJECT_STORE) private readonly store: ProjectStoreInterface,
    @Inject(PROJECTS_SERVICE)
    private readonly service: ProjectsServiceInterface,
    @Inject(TOASTER_SERVICE) private readonly toaster: ToasterServiceInterface,
    @Inject(CONFETTI_SERVICE)
    private readonly confetti: ConfettiServiceInterface
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

  isLoadingFor(loadingFor: LoadingFor, id: string) {
    return this.loadingFor.get(loadingFor) === id;
  }

  startLoadFor(loadingFor: LoadingFor, id: string) {
    this.loadingFor.set(loadingFor, id);
  }

  stopLoadFor(loadingFor: LoadingFor) {
    return this.loadingFor.delete(loadingFor);
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

  get removeLabel() {
    return this.category === 'refund'
      ? 'Supprimer le remboursement'
      : "Supprimer l'économie";
  }

  get toasterRemoveMessage() {
    return this.category === 'refund'
      ? 'Votre remboursement a bien été supprimé !'
      : 'Votre économie a bien été supprimée !';
  }

  get toasterFinishMessage() {
    return this.category === 'refund'
      ? 'Félicitations ! Votre remboursement est désormais completé !'
      : 'Félicitations ! Votre économie est désormais completée !';
  }

  closeModal(event: Event, modal: ModalNames) {
    event.stopPropagation();
    this.openModals.delete(modal);
  }

  openModal(modal: ModalNames) {
    this.openModals.add(modal);
  }

  openCreateModal() {
    this.creatingProject.set({
      category: this.category!,
      name: '',
      target: 0,
    });
    this.openModal('creation');
  }

  openRemoveModalFor(project: Project) {
    this.projectToRemove = project;
    this.openModal('remove');
  }

  openEditModal(project: Project) {
    this.updatingProject.set(project);
    this.openModal('update');
  }

  modalIsOpen(modal: ModalNames): boolean {
    return this.openModals.has(modal);
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
    this.openModals.delete('numpad-create');
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
    this.openModals.delete('numpad-update');
  }

  updateAddAmountValue(target: string) {
    const value = Number(target.replace(',', '.')).toFixed(2);
    this.addAmount.update(() => Number(value));
    this.openModals.delete('numpad-add-amount');
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
          this.closeModal(event, 'creation');
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
          this.closeModal(event, 'update');
        })
      )
      .subscribe(() => {
        this.toaster.success(this.toasterUpdateMessage);
      });
  }

  addAmountTo(project: Project) {
    this.projectForAddingAmount = project;
    this.openModal('add-amount');
  }

  addAmountToProject(event: Event) {
    event.stopPropagation();
    if (this.projectForAddingAmount === null) {
      return;
    }
    this.isLoading = true;
    this.service
      .addAmount(this.projectForAddingAmount, this.addAmount())
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.closeModal(event, 'add-amount');
          this.projectForAddingAmount = null;
          this.addAmount.set(0);
        })
      )
      .subscribe(() => {
        this.toaster.success('Votre montant a bien été ajouté !');
      });
  }

  finishProject(event: Event, project: Project) {
    event.stopPropagation();
    this.startLoadFor('finish', project.id);
    this.service
      .remove(project)
      .pipe(
        finalize(() => {
          this.stopLoadFor('finish');
          this.confetti.launch();
        })
      )
      .subscribe(() => {
        this.toaster.success(this.toasterFinishMessage);
      });
  }

  removeProject(event: Event) {
    event.stopPropagation();
    if (this.projectToRemove === null) {
      return;
    }
    this.isLoading = true;
    this.service
      .remove(this.projectToRemove)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.closeModal(event, 'remove');
          this.projectToRemove = null;
        })
      )
      .subscribe(() => {
        this.toaster.success(this.toasterRemoveMessage);
      });
  }

  rollback(event: Event, project: Project) {
    event.stopPropagation();
    this.startLoadFor('rollback', project.id);
    this.isLoading = true;
    this.service
      .rollback(project)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.stopLoadFor('rollback');
        })
      )
      .subscribe(() => {
        this.toaster.success("L'historique a bien été mis à jour !");
      });
  }

  reApply(event: Event, project: Project) {
    event.stopPropagation();
    this.startLoadFor('reApply', project.id);
    this.isLoading = true;
    this.service
      .reApply(project)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.stopLoadFor('reApply');
        })
      )
      .subscribe(() => {
        this.toaster.success("L'historique a bien été mis à jour !");
      });
  }
}
