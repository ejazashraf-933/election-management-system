import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Constituency } from '../constituencies/constituency.entity';
import { User } from '../users/user.entity';

export enum PollingStationStatus {
  SETUP = 'setup',
  OPEN = 'open',
  CLOSED = 'closed',
  RESULTS_SUBMITTED = 'results_submitted',
}

@Entity()
export class PollingStation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  code!: string;

  @ManyToOne(() => Constituency, { eager: true })
  @JoinColumn()
  constituency!: Constituency;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  presidingOfficer!: User;

  @Column({ default: 0 })
  totalRegisteredVoters!: number;

  @Column({ type: 'enum', enum: PollingStationStatus, default: PollingStationStatus.SETUP })
  status!: PollingStationStatus;

  @Column({ type: 'timestamp', nullable: true })
  openedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
