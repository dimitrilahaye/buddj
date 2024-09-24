import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity({name: "users"})
export class UserDao extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({type: "varchar", name: "google_id"})
    googleId: string;

    @Column({type: "varchar"})
    name: string;

    @Column({type: "varchar"})
    email: string;

    @Column({ type: "jsonb" })
    tokens: any;
}
