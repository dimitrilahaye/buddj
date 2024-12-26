import { ProjectTargetMustBePositiveError } from "../../errors/ProjectErrors.js";

export default class ProjectTarget {
  value: number;
  constructor(target: number) {
    if (target < 1) {
      throw new ProjectTargetMustBePositiveError();
    }
    this.value = Number(target.toFixed(2));
  }
}
