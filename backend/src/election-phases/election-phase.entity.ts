import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Election } from '../elections/election.entity';
import { Constituency } from '../constituencies/constituency.entity';

export enum PhaseStatus {
  SCHEDULED = 'scheduled',
  VOTING = 'voting',
  COUNTING = 'counting',
  COMPLETED = 'completed',
}

@Entity()
export class ElectionPhase {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Election, { eager: true })
  @JoinColumn()
  election!: Election;

  @Column()
  phaseNumber!: number;

  @Column()
  title!: string;

  @Column({ type: 'timestamp' })
  scheduledDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime!: Date;

  @Column({ type: 'enum', enum: PhaseStatus, default: PhaseStatus.SCHEDULED })
  status!: PhaseStatus;

  @ManyToMany(() => Constituency, { eager: true })
  @JoinTable()
  constituencies!: Constituency[];

  @CreateDateColumn()
  createdAt!: Date;
}
