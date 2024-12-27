import ProjectRepository from "../ports/repositories/ProjectRepository.js";

export interface GetAllProjectsByCategoryCommand {
  category: "refund" | "saving";
}

export default class GetAllProjectsByCategory {
  constructor(public readonly repository: ProjectRepository) {}

  async execute(command: GetAllProjectsByCategoryCommand) {
    return this.repository.getAllByCategory(command.category);
  }
}
