import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nomination, NominationStatus } from './nomination.entity';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { ScrutinizeNominationDto } from './dto/scrutinize-nomination.dto';
import { UsersService } from '../users/users.service';
import { ElectionsService } from '../elections/elections.service';
import { ConstituenciesService } from '../constituencies/constituencies.service';
import { ElectionStatus } from '../elections/election.entity';

@Injectable()
export class NominationsService {
  constructor(
    @InjectRepository(Nomination)
    private repo: Repository<Nomination>,
    private usersService: UsersService,
    private electionsService: ElectionsService,
    private constituenciesService: ConstituenciesService,
  ) {}

  async submit(applicantId: number, dto: CreateNominationDto): Promise<Nomination> {
    const election = await this.electionsService.findOne(dto.electionId);
    if (election.status !== ElectionStatus.NOMINATION_OPEN) {
      throw new BadRequestException('Nominations are not open for this election');
    }

    const existing = await this.repo.findOne({
      where: { applicant: { id: applicantId }, election: { id: dto.electionId } },
    });
    if (existing) throw new BadRequestException('You have already submitted a nomination for this election');

    const nomination = this.repo.create({
      isIndependent: dto.isIndependent ?? false,
      nominationFee: dto.nominationFee,
      proposerName: dto.proposerName,
      proposerCnic: dto.proposerCnic,
      seconderName: dto.seconderName,
      seconderCnic: dto.seconderCnic,
    });

    nomination.applicant = await this.usersService.findById(applicantId);
    nomination.election = election;
    nomination.constituency = await this.constituenciesService.findOne(dto.constituencyId);

    return this.repo.save(nomination);
  }

  async findAll(electionId?: number): Promise<Nomination[]> {
    const where: any = {};
    if (electionId) where.election = { id: electionId };
    return this.repo.find({ where, order: { submittedAt: 'DESC' } });
  }

  async findByConstituency(constituencyId: number, electionId: number): Promise<Nomination[]> {
    return this.repo.find({
      where: {
        constituency: { id: constituencyId },
        election: { id: electionId },
        status: NominationStatus.APPROVED,
      },
    });
  }

  async findOne(id: number): Promise<Nomination> {
    const nomination = await this.repo.findOne({ where: { id } });
    if (!nomination) throw new NotFoundException('Nomination not found');
    return nomination;
  }

  async scrutinize(id: number, officerId: number, dto: ScrutinizeNominationDto): Promise<Nomination> {
    const nomination = await this.findOne(id);
    if (
      nomination.status !== NominationStatus.SUBMITTED &&
      nomination.status !== NominationStatus.UNDER_SCRUTINY
    ) {
      throw new BadRequestException('Nomination cannot be scrutinized in its current status');
    }

    nomination.status = dto.status;
    nomination.scrutinyNotes = dto.scrutinyNotes ?? undefined;
    nomination.rejectionReason = dto.rejectionReason ?? undefined;
    nomination.scrutinizedBy = await this.usersService.findById(officerId);
    nomination.scrutinyDate = new Date();

    return this.repo.save(nomination);
  }

  async withdraw(id: number, userId: number): Promise<Nomination> {
    const nomination = await this.findOne(id);
    if (nomination.applicant.id !== userId) {
      throw new ForbiddenException('You can only withdraw your own nomination');
    }
    if (nomination.status === NominationStatus.WITHDRAWN) {
      throw new BadRequestException('Nomination already withdrawn');
    }
    nomination.status = NominationStatus.WITHDRAWN;
    return this.repo.save(nomination);
  }

  async appeal(id: number, userId: number): Promise<Nomination> {
    const nomination = await this.findOne(id);
    if (nomination.applicant.id !== userId) {
      throw new ForbiddenException('You can only appeal your own nomination');
    }
    if (nomination.status !== NominationStatus.REJECTED) {
      throw new BadRequestException('Only rejected nominations can be appealed');
    }
    nomination.status = NominationStatus.APPEALED;
    return this.repo.save(nomination);
  }

  async getStats(electionId: number) {
    const total = await this.repo.count({ where: { election: { id: electionId } } });
    const approved = await this.repo.count({ where: { election: { id: electionId }, status: NominationStatus.APPROVED } });
    const rejected = await this.repo.count({ where: { election: { id: electionId }, status: NominationStatus.REJECTED } });
    const pending = await this.repo.count({ where: { election: { id: electionId }, status: NominationStatus.SUBMITTED } });
    const withdrawn = await this.repo.count({ where: { election: { id: electionId }, status: NominationStatus.WITHDRAWN } });
    return { total, approved, rejected, pending, withdrawn };
  }
}
