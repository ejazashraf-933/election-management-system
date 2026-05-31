import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ElectionStatus {
  PENDING = 'pending',
  NOMINATION_OPEN = 'nomination_open',
  NOMINATION_CLOSED = 'nomination_closed',
  RUNNING = 'running',
  PAUSED = 'paused',
  COUNTING = 'counting',
  ENDED = 'ended',
}

export enum ElectionType {
  GENERAL = 'general',
  BY_ELECTION = 'by_election',
  LOCAL_BODY = 'local_body',
}

@Entity()
export class Election {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: ElectionStatus, default: ElectionStatus.PENDING })
  status!: ElectionStatus;

  @Column({ type: 'enum', enum: ElectionType, default: ElectionType.GENERAL })
  electionType!: ElectionType;

  @Column({ type: 'timestamp', nullable: true })
  nominationStartDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  nominationEndDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  withdrawalDeadline!: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime!: Date;

  @Column({ nullable: true })
  totalSeats!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
