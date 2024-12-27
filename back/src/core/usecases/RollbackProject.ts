import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface RollbackProjectCommand {
  id: string;
}

export default class RollbackProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: RollbackProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    project.rollback();

    await this.repository.save(project);

    return project;
  }
}
