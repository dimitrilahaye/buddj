import { InjectionToken } from '@angular/core';
import { Project } from '../../models/project.model';
import { Observable } from 'rxjs';

export type Category = 'refund' | 'saving';
export interface CreateCommand {
  name: string;
  target: number;
  category: Category;
}
export type UpdateCommand = Pick<Project, 'id' | 'name' | 'target'>;

export default interface ProjectsServiceInterface {
  updateProject(project: UpdateCommand): Observable<void>;
  rollback(project: Project): Observable<void>;
  reApply(project: Project): Observable<void>;
  remove(project: Project): Observable<void>;
  getById(projectId: string): Observable<void>;
  getAllByCategory(category: Category): Observable<void>;
  create(command: CreateCommand): Observable<void>;
  addAmount(project: Project, amount: number): Observable<void>;
}

export const PROJECTS_SERVICE = new InjectionToken<ProjectsServiceInterface>(
  'PROJECTS_SERVICE'
);
