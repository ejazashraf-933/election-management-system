import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../votes/vote.entity';
import { User, UserRole } from '../users/user.entity';
import { Election, ElectionStatus } from '../elections/election.entity';
import { Nomination } from '../nominations/nomination.entity';
import { PollingStation, PollingStationStatus } from '../polling-stations/polling-station.entity';
import { Constituency } from '../constituencies/constituency.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Vote)
    private votesRepo: Repository<Vote>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Election)
    private electionsRepo: Repository<Election>,
    @InjectRepository(Nomination)
    private nominationsRepo: Repository<Nomination>,
    @InjectRepository(PollingStation)
    private stationsRepo: Repository<PollingStation>,
    @InjectRepository(Constituency)
    private constituencyRepo: Repository<Constituency>,
  ) {}

  async getDashboardStats() {
    const [
      totalVoters, totalCandidates, totalAdmins, totalConstituencies,
      totalElections, runningElections, totalPollingStations,
      openStations, totalNominations,
    ] = await Promise.all([
      this.usersRepo.count({ where: { role: UserRole.VOTER } }),
      this.usersRepo.count({ where: { role: UserRole.CANDIDATE } }),
      this.usersRepo.count({ where: { role: UserRole.ADMIN } }),
      this.constituencyRepo.count(),
      this.electionsRepo.count(),
      this.electionsRepo.count({ where: { status: ElectionStatus.RUNNING } }),
      this.stationsRepo.count(),
      this.stationsRepo.count({ where: { status: PollingStationStatus.OPEN } }),
      this.nominationsRepo.count(),
    ]);

    return {
      totalVoters,
      totalCandidates,
      totalAdmins,
      totalConstituencies,
      totalElections,
      runningElections,
      totalPollingStations,
      openStations,
      totalNominations,
    };
  }

  async getVoterTurnout(electionId: number) {
    const turnout = await this.votesRepo
      .createQueryBuilder('vote')
      .leftJoin('vote.constituency', 'constituency')
      .select('constituency.id', 'constituencyId')
      .addSelect('constituency.name', 'constituencyName')
      .addSelect('COUNT(vote.id)', 'votesCast')
      .where('vote.election = :electionId', { electionId })
      .groupBy('constituency.id')
      .addGroupBy('constituency.name')
      .getRawMany();

    const constituencies = await this.constituencyRepo.find();

    return turnout.map(t => {
      const c = constituencies.find(c => c.id === parseInt(t.constituencyId));
      const registered = c?.totalRegisteredVoters ?? 0;
      return {
        constituencyId: t.constituencyId,
        constituencyName: t.constituencyName,
        votesCast: parseInt(t.votesCast),
        registeredVoters: registered,
        turnoutPercent: registered > 0 ? parseFloat(((parseInt(t.votesCast) / registered) * 100).toFixed(2)) : 0,
      };
    });
  }

  async getPartyWiseResults(electionId: number) {
    return this.votesRepo
      .createQueryBuilder('vote')
      .leftJoin('vote.candidate', 'candidate')
      .leftJoin('candidate.party', 'party')
      .select('party.id', 'partyId')
      .addSelect('party.name', 'partyName')
      .addSelect('COUNT(vote.id)', 'totalVotes')
      .where('vote.election = :electionId', { electionId })
      .groupBy('party.id')
      .addGroupBy('party.name')
      .orderBy('COUNT(vote.id)', 'DESC')
      .getRawMany();
  }

  async getConstituencyWiseWinners(electionId: number) {
    const results = await this.votesRepo
      .createQueryBuilder('vote')
      .leftJoin('vote.candidate', 'candidate')
      .leftJoin('candidate.user', 'user')
      .leftJoin('candidate.party', 'party')
      .leftJoin('vote.constituency', 'constituency')
      .select('constituency.id', 'constituencyId')
      .addSelect('constituency.name', 'constituencyName')
      .addSelect('candidate.id', 'candidateId')
      .addSelect('user.name', 'candidateName')
      .addSelect('party.name', 'partyName')
      .addSelect('COUNT(vote.id)', 'votes')
      .where('vote.election = :electionId', { electionId })
      .groupBy('constituency.id')
      .addGroupBy('constituency.name')
      .addGroupBy('candidate.id')
      .addGroupBy('user.name')
      .addGroupBy('party.name')
      .orderBy('constituency.id')
      .addOrderBy('COUNT(vote.id)', 'DESC')
      .getRawMany();

    const byConstituency: Record<string, any> = {};
    for (const r of results) {
      if (!byConstituency[r.constituencyId]) {
        byConstituency[r.constituencyId] = {
          constituencyId: r.constituencyId,
          constituencyName: r.constituencyName,
          winner: {
            candidateId: r.candidateId,
            candidateName: r.candidateName,
            partyName: r.partyName ?? 'Independent',
            votes: parseInt(r.votes),
          },
          allCandidates: [],
        };
      }
      byConstituency[r.constituencyId].allCandidates.push({
        candidateId: r.candidateId,
        candidateName: r.candidateName,
        partyName: r.partyName ?? 'Independent',
        votes: parseInt(r.votes),
      });
    }

    return Object.values(byConstituency);
  }
}
