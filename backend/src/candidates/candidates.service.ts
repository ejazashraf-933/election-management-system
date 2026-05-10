import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { UsersService } from '../users/users.service';
import { PartiesService } from '../parties/parties.service';
import { ConstituenciesService } from '../constituencies/constituencies.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
    private usersService: UsersService,
    private partiesService: PartiesService,
    private constituenciesService: ConstituenciesService,
  ) {}

  async create(userId: number, constituencyId: number, partyId?: number, isIndependent = false): Promise<Candidate> {
    const existing = await this.candidatesRepository.findOne({ where: { user: { id: userId } } });
    if (existing) throw new ConflictException('User is already registered as a candidate');

    const user = await this.usersService.findById(userId);
    const constituency = await this.constituenciesService.findOne(constituencyId);

    const candidate = this.candidatesRepository.create({
      user,
      constituency,
      isIndependent,
    });

    if (!isIndependent && partyId) {
      candidate.party = await this.partiesService.findOne(partyId);
    }

    return this.candidatesRepository.save(candidate);
  }

  async findAll(): Promise<Candidate[]> {
    return this.candidatesRepository.find({ relations: ['user', 'party', 'constituency'] });
  }

  async findOne(id: number): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
      relations: ['user', 'party', 'constituency'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async findByUserId(userId: number): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'party', 'constituency'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async updatePhoto(id: number, photo: string): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.photo = photo;
    return this.candidatesRepository.save(candidate);
  }
}
