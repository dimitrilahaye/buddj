import { inspect } from "node:util";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import Project from "../../../core/models/project/Project.js";
import Refund from "../../../core/models/project/Refund.js";
import Saving from "../../../core/models/project/Saving.js";
import TransferLog from "../../../core/models/project/TransferLog.js";
import ProjectName from "../../../core/models/project/ProjectName.js";
import ProjectTarget from "../../../core/models/project/ProjectTarget.js";
import TransferLogs from "../../../core/models/project/TransferLogs.js";
import ProjectAmount from "../../../core/models/project/ProjectAmount.js";

@Entity({ name: "projects" })
export class ProjectDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  category: string;

  @Column({ type: "decimal" })
  target: number;

  @Column({ type: "jsonb", default: [] })
  logs: {
    amount: number;
    date: Date;
    isActive: boolean;
  }[];

  static fromDomain(model: Project) {
    if (model instanceof Refund) {
      return ProjectDao.create({
        id: model.id,
        name: model.name.value,
        target: model.target.value,
        category: "refund",
        logs: model.logs.logs.map((log) => ({
          amount: log.amount.value,
          date: log.date,
          isActive: log.isActive,
        })),
      });
    }
    if (model instanceof Saving) {
      return ProjectDao.create({
        id: model.id,
        name: model.name.value,
        target: model.target.value,
        category: "saving",
        logs: model.logs.logs.map((log) => ({
          amount: log.amount.value,
          date: log.date,
          isActive: log.isActive,
        })),
      });
    }
    throw new Error(
      `ProjectDao.fromDomain » Unknown project category : ${inspect(model)}`
    );
  }

  toDomain(): Project {
    if (this.category === "refund") {
      return new Refund(
        this.id,
        new ProjectName(this.name),
        new ProjectTarget(Number(this.target)),
        new TransferLogs(
          this.logs.map(
            (log) =>
              new TransferLog(
                new ProjectAmount(log.amount),
                new Date(log.date),
                log.isActive
              )
          )
        )
      );
    }
    if (this.category === "saving") {
      return new Saving(
        this.id,
        new ProjectName(this.name),
        new ProjectTarget(Number(this.target)),
        new TransferLogs(
          this.logs.map(
            (log) =>
              new TransferLog(
                new ProjectAmount(log.amount),
                new Date(log.date),
                log.isActive
              )
          )
        )
      );
    }
    throw new Error(
      `ProjectDao.toDomain » Unknown project category : "${this.category}"`
    );
  }
}
