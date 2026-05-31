import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PollingStation } from '../polling-stations/polling-station.entity';
import { Election } from '../elections/election.entity';
import { User } from '../users/user.entity';

@Entity()
export class Form45 {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PollingStation, { eager: true })
  @JoinColumn()
  pollingStation!: PollingStation;

  @ManyToOne(() => Election, { eager: true })
  @JoinColumn()
  election!: Election;

  @Column({ default: 0 })
  totalRegisteredVoters!: number;

  @Column({ default: 0 })
  totalVotesCast!: number;

  @Column({ default: 0 })
  totalValidVotes!: number;

  @Column({ default: 0 })
  totalRejectedVotes!: number;

  @Column({ type: 'jsonb', nullable: true })
  candidateVotes!: { candidateId: number; candidateName: string; partyName: string; votes: number }[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  submittedBy!: User;

  @Column({ nullable: true })
  stampHash!: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
