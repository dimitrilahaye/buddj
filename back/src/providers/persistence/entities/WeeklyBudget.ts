import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {AccountDao} from "./Account.js";
import WeeklyBudget from "../../../core/models/month/account/WeeklyBudget.js";
import {WeeklyExpenseDao} from "./WeeklyExpense.js";

@Entity({name: "weekly_budgets"})
export class WeeklyBudgetDao extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    name: string;

    @Column({type: "decimal", name: "initial_balance"})
    initialBalance: number;

    @Column({type: "decimal", name: "current_balance"})
    currentBalance: number;

    @Column({type: "timestamptz", name: "start_at", default: null, nullable: true})
    startAt: Date | null;

    @Column({type: "timestamptz", name: "end_at", default: null, nullable: true})
    endAt: Date | null;

    @ManyToOne(() => AccountDao, (account) => account.weeklyBudgets, {
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
    })
    @JoinColumn({name: "account_id"})
    account: AccountDao;

    @OneToMany(() => WeeklyExpenseDao, (expense) => expense.weeklyBudget, {eager: true, cascade: true})
    expenses: WeeklyExpenseDao[];

    static fromDomain(model: WeeklyBudget) {
        return WeeklyBudgetDao.create({
            id: model.id,
            name: model.name,
            currentBalance: Number(model.currentBalance),
            initialBalance: Number(model.initialBalance),
            startAt: model.startAt,
            endAt: model.endAt,
            expenses: model.expenses.map((expense) => WeeklyExpenseDao.fromDomain(expense)),
        });
    }

    toDomain(): WeeklyBudget {
        return new WeeklyBudget({
            id: this.id,
            name: this.name,
            initialBalance: Number(this.initialBalance),
            expenses: this.expenses.map((expense) => expense.toDomain()),
        });
    }
}
