import { ProjectAmountMustBePositiveError } from "../../errors/ProjectErrors.js";

export default class ProjectAmount {
  value: number;
  constructor(target: number) {
    if (target < 1) {
      throw new ProjectAmountMustBePositiveError();
    }
    this.value = Number(target.toFixed(2));
  }
}
