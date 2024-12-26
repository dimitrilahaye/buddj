import { ProjectNameCanNotBeEmptyError } from "../../errors/ProjectErrors.js";

export default class ProjectName {
  value: string;
  constructor(name: string) {
    if (name.length === 0) {
      throw new ProjectNameCanNotBeEmptyError();
    }
    this.value = name;
  }
}
