import ProjectFactory from "../factories/ProjectFactory.js";
import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface CreateProjectCommand {
  name: string;
  target: number;
  category: "refund" | "saving";
}

export default class CreateProject {
  constructor(
    public readonly repository: ProjectRepository,
    public readonly factory: ProjectFactory
  ) {}

  async execute(command: CreateProjectCommand) {
    const project = this.factory.create(command);

    await this.repository.save(project);

    return project;
  }
}
