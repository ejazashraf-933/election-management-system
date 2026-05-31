import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservedSeat } from './reserved-seat.entity';
import { ElectionsService } from '../elections/elections.service';
import { ConstituenciesService } from '../constituencies/constituencies.service';
import { SeatType } from '../constituencies/constituency.entity';

@Injectable()
export class ReservedSeatsService {
  constructor(
    @InjectRepository(ReservedSeat)
    private repo: Repository<ReservedSeat>,
    private electionsService: ElectionsService,
    private constituenciesService: ConstituenciesService,
  ) {}

  async calculateAllocation(electionId: number, partyVotes: { partyId: number; partyName: string; votes: number }[]) {
    const election = await this.electionsService.findOne(electionId);
    const reservedConstituencies = await this.constituenciesService.findAll();
    const reserved = reservedConstituencies.filter(c => c.seatType === SeatType.RESERVED);

    const totalVotes = partyVotes.reduce((sum, p) => sum + p.votes, 0);

    const allocation = partyVotes.map(pv => ({
      partyId: pv.partyId,
      partyName: pv.partyName,
      votes: pv.votes,
      voteSharePercent: totalVotes > 0 ? parseFloat(((pv.votes / totalVotes) * 100).toFixed(2)) : 0,
      seatsEntitled: totalVotes > 0 ? Math.floor((pv.votes / totalVotes) * reserved.length) : 0,
    })).sort((a, b) => b.votes - a.votes);

    return {
      electionId,
      totalReservedSeats: reserved.length,
      totalVotesCast: totalVotes,
      allocation,
    };
  }

  async findByElection(electionId: number): Promise<ReservedSeat[]> {
    return this.repo.find({
      where: { election: { id: electionId } },
      order: { rank: 'ASC' },
    });
  }
}
