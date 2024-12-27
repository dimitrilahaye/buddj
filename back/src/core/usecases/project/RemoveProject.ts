import { ProjectNotFoundError } from "../../errors/ProjectErrors.js";
import ProjectRepository from "../../ports/repositories/ProjectRepository.js";

export interface RemoveProjectCommand {
  id: string;
}

export default class RemoveProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: RemoveProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    await this.repository.remove(project.id);
  }
}
