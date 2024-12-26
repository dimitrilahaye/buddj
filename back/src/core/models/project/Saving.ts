import Project from "./Project.js";
import ProjectName from "./ProjectName.js";
import ProjectTarget from "./ProjectTarget.js";
import TransferLogs from "./TransferLogs.js";

export default class Saving extends Project {
  constructor(
    id: string,
    name: ProjectName,
    target: ProjectTarget,
    logs: TransferLogs
  ) {
    super(id, name, target, logs);
  }
}
