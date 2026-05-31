import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ConstituencyType {
  AJK_GENERAL = 'ajk_general',
  REFUGEE_PAKISTAN = 'refugee_pakistan',
  RESERVED_WOMEN = 'reserved_women',
  RESERVED_TECHNOCRAT = 'reserved_technocrat',
  RESERVED_ULAMA = 'reserved_ulama',
  RESERVED_OVERSEAS = 'reserved_overseas',
}

export enum SeatType {
  GENERAL = 'general',
  RESERVED = 'reserved',
}

@Entity()
export class Constituency {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  province!: string;

  @Column({ nullable: true })
  district!: string;

  @Column({ type: 'enum', enum: ConstituencyType, default: ConstituencyType.AJK_GENERAL })
  type!: ConstituencyType;

  @Column({ type: 'enum', enum: SeatType, default: SeatType.GENERAL })
  seatType!: SeatType;

  @Column({ nullable: true })
  seatNumber!: string;

  @Column({ default: 0 })
  totalRegisteredVoters!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
