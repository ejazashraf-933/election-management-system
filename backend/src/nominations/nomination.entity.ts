import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Constituency } from '../constituencies/constituency.entity';
import { Election } from '../elections/election.entity';
import { Party } from '../parties/party.entity';

export enum NominationStatus {
  SUBMITTED = 'submitted',
  UNDER_SCRUTINY = 'under_scrutiny',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  APPEALED = 'appealed',
}

@Entity()
export class Nomination {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  applicant!: User;

  @ManyToOne(() => Election, { eager: true })
  @JoinColumn()
  election!: Election;

  @ManyToOne(() => Constituency, { eager: true })
  @JoinColumn()
  constituency!: Constituency;

  @ManyToOne(() => Party, { nullable: true, eager: true })
  @JoinColumn()
  party!: Party;

  @Column({ default: false })
  isIndependent!: boolean;

  @Column({ type: 'enum', enum: NominationStatus, default: NominationStatus.SUBMITTED })
  status!: NominationStatus;

  @Column({ nullable: true })
  scrutinyNotes?: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'scrutinized_by_id' })
  scrutinizedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  scrutinyDate?: Date;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  nominationFee?: number;

  @Column({ nullable: true })
  proposerName?: string;

  @Column({ nullable: true })
  proposerCnic?: string;

  @Column({ nullable: true })
  seconderName?: string;

  @Column({ nullable: true })
  seconderCnic?: string;

  @CreateDateColumn()
  submittedAt!: Date;
}
