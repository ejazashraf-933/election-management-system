import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { ElectionsService } from '../elections/elections.service';
import { CandidatesService } from '../candidates/candidates.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import { ElectionStatus } from '../elections/election.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    private electionsService: ElectionsService,
    private candidatesService: CandidatesService,
    private usersService: UsersService,
  ) {}

  async castVote(voterId: number, candidateId: number, electionId: number): Promise<Vote> {
    // Check election is running
    const election = await this.electionsService.findOne(electionId);
    if (election.status !== ElectionStatus.RUNNING) {
      throw new BadRequestException('Voting is not allowed. Election is not running');
    }

    // Get voter
    const voter = await this.usersService.findById(voterId);

    // Get candidate with constituency
    const candidate = await this.candidatesService.findOne(candidateId);

    // If voter is a candidate, they can only vote for themselves
    if (voter.role === UserRole.CANDIDATE) {
      const voterAsCandidate = await this.candidatesService.findByUserId(voterId);
      if (voterAsCandidate.id !== candidateId) {
        throw new ForbiddenException('Candidates can only vote for themselves');
      }
    }

    // Check voter and candidate are in the same constituency
    if (voter.constituency?.id !== candidate.constituency?.id) {
      throw new ForbiddenException('You can only vote in your own constituency');
    }

    // Check voter has not already voted in this election
    const alreadyVoted = await this.votesRepository.findOne({
      where: { voter: { id: voterId }, election: { id: electionId } },
    });
    if (alreadyVoted) throw new BadRequestException('You have already voted in this election');

    const vote = this.votesRepository.create({
      voter,
      candidate,
      election,
      constituency: candidate.constituency,
    });

    return this.votesRepository.save(vote);
  }

  async getResults(electionId: number) {
    const results = await this.votesRepository
      .createQueryBuilder('vote')
      .select('vote.candidateId', 'candidateId')
      .addSelect('COUNT(vote.id)', 'totalVotes')
      .leftJoin('vote.candidate', 'candidate')
      .leftJoin('candidate.user', 'user')
      .addSelect('user.name', 'candidateName')
      .leftJoin('candidate.party', 'party')
      .addSelect('party.name', 'partyName')
      .where('vote.electionId = :electionId', { electionId })
      .groupBy('vote.candidateId')
      .addGroupBy('user.name')
      .addGroupBy('party.name')
      .orderBy('totalVotes', 'DESC')
      .getRawMany();

    return results;
  }

  async getVotingHistory(voterId: number) {
    return this.votesRepository.find({
      where: { voter: { id: voterId } },
      relations: ['candidate', 'candidate.user', 'candidate.party', 'election'],
      order: { castedAt: 'DESC' },
    });
  }
}
