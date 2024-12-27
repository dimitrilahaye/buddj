import { Injectable } from '@angular/core';
import ProjectsServiceInterface, {
  Category,
  CreateCommand,
} from './projects.service.interface';
import { map, Observable } from 'rxjs';
import { Response } from '../../models/response.model';
import { Project } from '../../models/project.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService implements ProjectsServiceInterface {
  private readonly apiUrl: string;

  constructor(private readonly http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  updateProject(project: Project): Observable<void> {
    return this.http
      .patch<Response<Project>>(`${this.apiUrl}/projects/${project.id}`, {
        name: project.name,
        target: project.target,
      })
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  rollback(project: Project): Observable<void> {
    return this.http
      .patch<Response<Project>>(
        `${this.apiUrl}/projects/${project.id}/rollback`,
        null
      )
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  reApply(project: Project): Observable<void> {
    return this.http
      .patch<Response<Project>>(
        `${this.apiUrl}/projects/${project.id}/re-apply`,
        null
      )
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  remove(project: Project): Observable<void> {
    return this.http
      .delete<Response<void>>(`${this.apiUrl}/projects/${project.id}`)
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  getById(projectId: string): Observable<void> {
    return this.http
      .get<Response<Project>>(`${this.apiUrl}/projects/${projectId}`)
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  getAllByCategory(category: Category): Observable<void> {
    return this.http
      .get<Response<Project[]>>(`${this.apiUrl}/projects/category/${category}`)
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  create(command: CreateCommand): Observable<void> {
    return this.http
      .post<Response<Project>>(`${this.apiUrl}/projects`, command)
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  addAmount(project: Project, amount: number): Observable<void> {
    return this.http
      .patch<Response<Project>>(`${this.apiUrl}/projects/${project.id}/add`, {
        amount,
      })
      .pipe(
        // tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }
}
