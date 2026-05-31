import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Election } from '../elections/election.entity';
import { Party } from '../parties/party.entity';
import { Constituency } from '../constituencies/constituency.entity';
import { User } from '../users/user.entity';

@Entity()
export class ReservedSeat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Election, { eager: true })
  @JoinColumn()
  election!: Election;

  @ManyToOne(() => Party, { eager: true })
  @JoinColumn()
  party!: Party;

  @ManyToOne(() => Constituency, { eager: true })
  @JoinColumn()
  constituency!: Constituency;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  allocatedTo!: User;

  @Column({ nullable: true })
  partyVoteShare!: number;

  @Column({ nullable: true })
  seatsEntitled!: number;

  @Column({ nullable: true })
  rank!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
