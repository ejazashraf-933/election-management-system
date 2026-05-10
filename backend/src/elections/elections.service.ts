import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Election, ElectionStatus } from './election.entity';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
  ) {}

  async create(data: Partial<Election>): Promise<Election> {
    const election = this.electionsRepository.create(data);
    return this.electionsRepository.save(election);
  }

  async findAll(): Promise<Election[]> {
    return this.electionsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Election> {
    const election = await this.electionsRepository.findOne({ where: { id } });
    if (!election) throw new NotFoundException('Election not found');
    return election;
  }

  async findRunning(): Promise<Election | null> {
    return this.electionsRepository.findOne({
      where: { status: ElectionStatus.RUNNING },
    });
  }

  async start(id: number): Promise<Election> {
    const running = await this.findRunning();
    if (running && running.id !== id) {
      throw new BadRequestException('Another election is already running');
    }

    const election = await this.findOne(id);
    if (election.status === ElectionStatus.ENDED) {
      throw new BadRequestException('Election has already ended');
    }

    election.status = ElectionStatus.RUNNING;
    election.startTime = new Date();
    return this.electionsRepository.save(election);
  }

  async pause(id: number): Promise<Election> {
    const election = await this.findOne(id);
    if (election.status !== ElectionStatus.RUNNING) {
      throw new BadRequestException('Only a running election can be paused');
    }
    election.status = ElectionStatus.PAUSED;
    return this.electionsRepository.save(election);
  }

  async end(id: number): Promise<Election> {
    const election = await this.findOne(id);
    if (election.status === ElectionStatus.ENDED) {
      throw new BadRequestException('Election has already ended');
    }
    election.status = ElectionStatus.ENDED;
    election.endTime = new Date();
    return this.electionsRepository.save(election);
  }

  async update(id: number, data: Partial<Election>): Promise<Election> {
    const election = await this.findOne(id);
    Object.assign(election, data);
    return this.electionsRepository.save(election);
  }
}
