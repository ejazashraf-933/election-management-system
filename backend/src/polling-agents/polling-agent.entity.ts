import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Nomination } from '../nominations/nomination.entity';
import { PollingStation } from '../polling-stations/polling-station.entity';
import { Election } from '../elections/election.entity';

@Entity()
export class PollingAgent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  agent!: User;

  @ManyToOne(() => Nomination, { eager: true })
  @JoinColumn()
  nomination!: Nomination;

  @ManyToOne(() => PollingStation, { eager: true })
  @JoinColumn()
  pollingStation!: PollingStation;

  @ManyToOne(() => Election, { eager: true })
  @JoinColumn()
  election!: Election;

  @Column({ nullable: true })
  appointmentLetter!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
