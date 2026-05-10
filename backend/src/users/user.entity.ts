import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Constituency } from '../constituencies/constituency.entity';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  VOTER = 'voter',
  CANDIDATE = 'candidate',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VOTER })
  role!: UserRole;

  @ManyToOne(() => Constituency, { nullable: true, eager: true })
  @JoinColumn()
  constituency!: Constituency;

  @CreateDateColumn()
  createdAt!: Date;
}
