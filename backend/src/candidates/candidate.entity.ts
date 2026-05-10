import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Party } from '../parties/party.entity';
import { Constituency } from '../constituencies/constituency.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Party, { nullable: true, eager: true })
  party!: Party;

  @ManyToOne(() => Constituency, { eager: true })
  constituency!: Constituency;

  @Column({ nullable: true })
  photo!: string;

  @Column({ default: false })
  isIndependent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
