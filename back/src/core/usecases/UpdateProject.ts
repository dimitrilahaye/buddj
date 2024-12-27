import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import ProjectName from "../models/project/ProjectName.js";
import ProjectTarget from "../models/project/ProjectTarget.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface UpdateProjectCommand {
  id: string;
  name?: string;
  target?: number;
}

export default class UpdateProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: UpdateProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    if (command.name) {
      project.updateName(new ProjectName(command.name));
    }
    if (command.target) {
      project.updateTarget(new ProjectTarget(command.target));
    }

    await this.repository.update(project);

    return project;
  }
}
