import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface GetProjectCommand {
  id: string;
}

export default class GetProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: GetProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    return project;
  }
}
