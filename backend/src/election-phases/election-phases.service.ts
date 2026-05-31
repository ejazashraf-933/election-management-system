import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectionPhase, PhaseStatus } from './election-phase.entity';
import { CreateElectionPhaseDto } from './dto/create-election-phase.dto';
import { ElectionsService } from '../elections/elections.service';
import { ConstituenciesService } from '../constituencies/constituencies.service';

@Injectable()
export class ElectionPhasesService {
  constructor(
    @InjectRepository(ElectionPhase)
    private repo: Repository<ElectionPhase>,
    private electionsService: ElectionsService,
    private constituenciesService: ConstituenciesService,
  ) {}

  async create(dto: CreateElectionPhaseDto): Promise<ElectionPhase> {
    const phase = this.repo.create({
      phaseNumber: dto.phaseNumber,
      title: dto.title,
      scheduledDate: new Date(dto.scheduledDate),
    });
    phase.election = await this.electionsService.findOne(dto.electionId);
    phase.constituencies = await Promise.all(
      dto.constituencyIds.map(id => this.constituenciesService.findOne(id)),
    );
    return this.repo.save(phase);
  }

  async findByElection(electionId: number): Promise<ElectionPhase[]> {
    return this.repo.find({
      where: { election: { id: electionId } },
      order: { phaseNumber: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ElectionPhase> {
    const phase = await this.repo.findOne({ where: { id } });
    if (!phase) throw new NotFoundException('Election phase not found');
    return phase;
  }

  async startPhase(id: number): Promise<ElectionPhase> {
    const phase = await this.findOne(id);
    if (phase.status !== PhaseStatus.SCHEDULED) {
      throw new BadRequestException('Phase is not in scheduled state');
    }
    phase.status = PhaseStatus.VOTING;
    phase.startTime = new Date();
    return this.repo.save(phase);
  }

  async endPhase(id: number): Promise<ElectionPhase> {
    const phase = await this.findOne(id);
    if (phase.status !== PhaseStatus.VOTING) {
      throw new BadRequestException('Phase is not in voting state');
    }
    phase.status = PhaseStatus.COUNTING;
    phase.endTime = new Date();
    return this.repo.save(phase);
  }

  async completePhase(id: number): Promise<ElectionPhase> {
    const phase = await this.findOne(id);
    phase.status = PhaseStatus.COMPLETED;
    return this.repo.save(phase);
  }
}
