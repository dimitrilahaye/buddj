import Project from "../../models/project/Project.js";

export default interface ProjectRepository {
  getAllByCategory(category: "refund" | "saving"): Promise<Project[]>;

  getById(id: string): Promise<Project | null>;

  update(project: Project): Promise<void>;

  // save / rollback / re-apply / add amount
  save(project: Project): Promise<void>;

  remove(projectId: string): Promise<void>;
}
