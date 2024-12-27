import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import ProjectAmount from "../models/project/ProjectAmount.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface AddAmountProjectCommand {
  id: string;
  amount: number;
}

export default class AddAmountProject {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: AddAmountProjectCommand) {
    const project = await this.repository.getById(command.id);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    project.add(new ProjectAmount(command.amount));

    await this.repository.save(project);

    return project;
  }
}
