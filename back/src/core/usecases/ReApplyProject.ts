import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface ReApplyProjectCommand {
  id: string;
}

export default class ReApplyProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: ReApplyProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    project.reApply();

    await this.repository.save(project);

    return project;
  }
}
