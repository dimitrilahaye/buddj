import { UnknownCategoryError } from "../errors/ProjectErrors.js";
import ProjectName from "../models/project/ProjectName.js";
import ProjectTarget from "../models/project/ProjectTarget.js";
import Refund from "../models/project/Refund.js";
import Saving from "../models/project/Saving.js";
import TransferLogs from "../models/project/TransferLogs.js";
import IdProvider from "../ports/providers/IdProvider.js";
import { CreateProjectCommand } from "../usecases/CreateProject.js";

export default class ProjectFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(command: CreateProjectCommand) {
    const id = this.idProvider.get();
    if (command.category === "refund") {
      return new Refund(
        id,
        new ProjectName(command.name),
        new ProjectTarget(command.target),
        new TransferLogs()
      );
    }
    if (command.category === "saving") {
      return new Saving(
        id,
        new ProjectName(command.name),
        new ProjectTarget(command.target),
        new TransferLogs()
      );
    }
    throw new UnknownCategoryError(command.category);
  }
}
