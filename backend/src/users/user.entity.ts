import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Constituency } from '../constituencies/constituency.entity';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  CHIEF_ELECTION_COMMISSIONER = 'chief_election_commissioner',
  DISTRICT_RETURNING_OFFICER = 'district_returning_officer',
  RETURNING_OFFICER = 'returning_officer',
  PRESIDING_OFFICER = 'presiding_officer',
  POLLING_AGENT = 'polling_agent',
  OBSERVER = 'observer',
  VOTER = 'voter',
  CANDIDATE = 'candidate',
}

export enum VoterStatus {
  REGISTERED = 'registered',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  DISQUALIFIED = 'disqualified',
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

  @Column({ nullable: true, unique: true })
  cnic!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date;

  @Column({ nullable: true })
  domicileDistrict!: string;

  @Column({ default: false })
  isAJKResident!: boolean;

  @Column({ type: 'enum', enum: VoterStatus, default: VoterStatus.REGISTERED })
  voterStatus!: VoterStatus;

  @Column({ nullable: true })
  phone!: string;

  @ManyToOne(() => Constituency, { nullable: true, eager: true })
  @JoinColumn()
  constituency!: Constituency;

  @CreateDateColumn()
  createdAt!: Date;
}
