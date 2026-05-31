import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form45 } from './form45.entity';
import { SubmitForm45Dto } from './dto/submit-form45.dto';
import { PollingStationsService } from '../polling-stations/polling-stations.service';
import { ElectionsService } from '../elections/elections.service';
import { CandidatesService } from '../candidates/candidates.service';
import { UsersService } from '../users/users.service';
import { PollingStationStatus } from '../polling-stations/polling-station.entity';
import * as crypto from 'crypto';

@Injectable()
export class Form45Service {
  constructor(
    @InjectRepository(Form45)
    private repo: Repository<Form45>,
    private pollingStationsService: PollingStationsService,
    private electionsService: ElectionsService,
    private candidatesService: CandidatesService,
    private usersService: UsersService,
  ) {}

  async submit(pollingStationId: number, submitterId: number, dto: SubmitForm45Dto): Promise<Form45> {
    const station = await this.pollingStationsService.findOne(pollingStationId);
    if (station.status !== PollingStationStatus.CLOSED) {
      throw new BadRequestException('Polling station must be closed before submitting Form 45');
    }

    const existing = await this.repo.findOne({
      where: { pollingStation: { id: pollingStationId }, election: { id: dto.electionId } },
    });
    if (existing) throw new BadRequestException('Form 45 already submitted for this polling station');

    const enrichedVotes = await Promise.all(
      dto.candidateVotes.map(async cv => {
        try {
          const candidate = await this.candidatesService.findOne(cv.candidateId);
          return {
            candidateId: cv.candidateId,
            candidateName: candidate.user?.name ?? 'Unknown',
            partyName: candidate.party?.name ?? 'Independent',
            votes: cv.votes,
          };
        } catch {
          return { candidateId: cv.candidateId, candidateName: 'Unknown', partyName: 'Unknown', votes: cv.votes };
        }
      }),
    );

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ pollingStationId, dto, submitterId, ts: Date.now() }))
      .digest('hex');

    const form = this.repo.create({
      totalRegisteredVoters: dto.totalRegisteredVoters,
      totalVotesCast: dto.totalVotesCast,
      totalValidVotes: dto.totalValidVotes,
      totalRejectedVotes: dto.totalRejectedVotes,
      candidateVotes: enrichedVotes,
      stampHash: hash,
      submittedAt: new Date(),
    });

    form.pollingStation = station;
    form.election = await this.electionsService.findOne(dto.electionId);
    form.submittedBy = await this.usersService.findById(submitterId);

    const saved = await this.repo.save(form);

    await this.pollingStationsService.update(pollingStationId, { status: PollingStationStatus.RESULTS_SUBMITTED });

    return saved;
  }

  async findByElection(electionId: number): Promise<Form45[]> {
    return this.repo.find({
      where: { election: { id: electionId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPollingStation(pollingStationId: number): Promise<Form45 | null> {
    return this.repo.findOne({ where: { pollingStation: { id: pollingStationId } } });
  }

  async getConsolidatedResults(electionId: number) {
    const forms = await this.findByElection(electionId);
    const consolidated: Record<number, { candidateId: number; candidateName: string; partyName: string; totalVotes: number }> = {};

    let totalVotesCast = 0;
    let totalValidVotes = 0;
    let totalRejectedVotes = 0;

    for (const form of forms) {
      totalVotesCast += form.totalVotesCast;
      totalValidVotes += form.totalValidVotes;
      totalRejectedVotes += form.totalRejectedVotes;

      for (const cv of form.candidateVotes ?? []) {
        if (!consolidated[cv.candidateId]) {
          consolidated[cv.candidateId] = {
            candidateId: cv.candidateId,
            candidateName: cv.candidateName,
            partyName: cv.partyName,
            totalVotes: 0,
          };
        }
        consolidated[cv.candidateId].totalVotes += cv.votes;
      }
    }

    const candidates = Object.values(consolidated).sort((a, b) => b.totalVotes - a.totalVotes);

    return {
      electionId,
      totalPollingStations: forms.length,
      totalVotesCast,
      totalValidVotes,
      totalRejectedVotes,
      candidates,
    };
  }
}
