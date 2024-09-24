import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {WeeklyBudgetDao} from "./WeeklyBudget.js";
import {OutflowDao} from "./Outflow.js";
import Account from "../../../core/models/month/account/Account.js";

@Entity({name: "accounts"})
export class AccountDao extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "decimal", name: "current_balance"})
    currentBalance: number;

    @OneToMany(() => OutflowDao, (outflow) => outflow.account, { eager: true, cascade: true })
    outflows: OutflowDao[];

    @OneToMany(() => WeeklyBudgetDao, (weeklyBudget) => weeklyBudget.account, { eager: true, cascade: true })
    weeklyBudgets: WeeklyBudgetDao[];

    static fromDomain(model: Account) {
        return AccountDao.create({
            id: model.id,
            currentBalance: Number(model.currentBalance),
            outflows: model.outflows.map((outflow) => OutflowDao.fromDomain(outflow)),
            weeklyBudgets: model.weeklyBudgets.map((weeklyBudget) => WeeklyBudgetDao.fromDomain(weeklyBudget)),
        });
    }

    toDomain(): Account {
        return new Account({
            id: this.id,
            currentBalance: Number(this.currentBalance),
            outflows: this.outflows.map((outflow) => outflow.toDomain()),
            weeklyBudgets: this.weeklyBudgets.map((weeklyBudget) => weeklyBudget.toDomain()),
        });
    }
}
