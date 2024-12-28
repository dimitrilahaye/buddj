import Project from "../../../core/models/project/Project.js";
import Refund from "../../../core/models/project/Refund.js";

interface ProjectDto {
  id: string;
  name: string;
  target: number;
  totalAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
  category: "refund" | "saving";
}

export type ProjectDtoBuilder = (model: Project) => ProjectDto;

export default function projectDto(model: Project): ProjectDto {
  return {
    id: model.id,
    name: model.name.value,
    target: model.target.value,
    totalAmount: model.totalAmount(),
    canRollback: model.canRollback(),
    canReApply: model.canReApply(),
    canFinish: model.totalAmount() === model.target.value,
    category: model instanceof Refund ? "refund" : "saving",
  };
}
