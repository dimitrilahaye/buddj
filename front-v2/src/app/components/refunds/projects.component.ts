import { Component, Inject, OnInit, signal, Signal } from '@angular/core';
import { Category } from '../../services/projects/projects.service.interface';
import { ActivatedRoute, Router } from '@angular/router';
import ProjectStoreInterface, {
  PROJECT_STORE,
} from '../../stores/projects/projects.store.interface';
import { Project } from '../../models/project.model';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';
import { DesignSystemModule } from '../../design-system/design-system.module';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [HeaderBackButtonComponent, DesignSystemModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  category: Category | undefined;
  projects: Signal<Project[] | null> = signal(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(PROJECT_STORE) private readonly store: ProjectStoreInterface
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
    return this.projects() === null || this.projects()!.length === 0;
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
}
