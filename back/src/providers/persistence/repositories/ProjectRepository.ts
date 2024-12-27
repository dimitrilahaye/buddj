import Project from "../../../core/models/project/Project.js";
import ProjectRepository from "../../../core/ports/repositories/ProjectRepository.js";
import { ProjectDao } from "../entities/Project.js";

export default class TypeormProjectRepository implements ProjectRepository {
  async getAllByCategory(category: "refund" | "saving"): Promise<Project[]> {
    const dao = await ProjectDao.findBy({
      category,
    });
    return dao.map((project) => project.toDomain());
  }

  async getById(id: string): Promise<Project | null> {
    const dao = await ProjectDao.findOneBy({
      id,
    });
    if (!dao) {
      return null;
    }

    return dao.toDomain();
  }

  async update(project: Project): Promise<void> {
    await ProjectDao.update(project.id, {
      name: project.name.value,
      target: project.target.value,
    });
  }

  async save(project: Project): Promise<void> {
    const dao = ProjectDao.fromDomain(project);
    await dao.save();
  }

  async remove(projectId: string): Promise<void> {
    await ProjectDao.delete(projectId);
  }
}
