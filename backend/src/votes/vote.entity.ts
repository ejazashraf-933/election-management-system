import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Election } from '../elections/election.entity';
import { Constituency } from '../constituencies/constituency.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn()
  voter!: User;

  @ManyToOne(() => Candidate)
  @JoinColumn()
  candidate!: Candidate;

  @ManyToOne(() => Election)
  @JoinColumn()
  election!: Election;

  @ManyToOne(() => Constituency)
  @JoinColumn()
  constituency!: Constituency;

  @CreateDateColumn()
  castedAt!: Date;
}
