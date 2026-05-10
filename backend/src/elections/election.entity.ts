import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ElectionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  ENDED = 'ended',
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

  @Column({ type: 'timestamp', nullable: true })
  startTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
