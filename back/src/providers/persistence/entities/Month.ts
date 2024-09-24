import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {AccountDao} from "./Account.js";
import Month from "../../../core/models/month/Month.js";

@Entity({name: "months"})
export class MonthDao extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "timestamptz"})
    date: Date;

    @Column({type: "timestamptz", name: "start_at", default: null, nullable: true})
    startAt: Date | null;

    @Column({type: "timestamptz", name: "end_at", default: null, nullable: true})
    endAt: Date | null;

    @Column({type: "boolean", name: "is_archived", default: false})
    isArchived: boolean;

    @OneToOne(() => AccountDao, {eager: true, cascade: true})
    @JoinColumn({name: "account_id"})
    account: AccountDao;

    static fromDomain(model: Month) {
        return MonthDao.create({
            id: model.id,
            date: model.date,
            startAt: model.startAt,
            endAt: model.endAt,
            isArchived: model.isArchived,
            account: AccountDao.fromDomain(model.account),
        });
    }

    toDomain(): Month {
        return new Month({
            id: this.id,
            date: this.date,
            isArchived: this.isArchived,
            account: this.account.toDomain(),
        });
    }
}
