import Project from "../../../core/models/project/Project.js";

interface ProjectDto {
  id: string;
  name: string;
  target: number;
  leftAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
}

export type ProjectDtoBuilder = (model: Project) => ProjectDto;

export default function projectDto(model: Project): ProjectDto {
  return {
    id: model.id,
    name: model.name.value,
    target: model.target.value,
    leftAmount: model.leftAmount(),
    canRollback: model.canRollback(),
    canReApply: model.canReApply(),
    canFinish: model.leftAmount() === 0,
  };
}
