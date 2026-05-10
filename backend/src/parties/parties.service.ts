import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party } from './party.entity';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private partiesRepository: Repository<Party>,
  ) {}

  async create(data: Partial<Party>): Promise<Party> {
    const existing = await this.partiesRepository.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('Party with this name already exists');
    const party = this.partiesRepository.create(data);
    return this.partiesRepository.save(party);
  }

  async findAll(): Promise<Party[]> {
    return this.partiesRepository.find();
  }

  async findOne(id: number): Promise<Party> {
    const party = await this.partiesRepository.findOne({ where: { id } });
    if (!party) throw new NotFoundException('Party not found');
    return party;
  }

  async update(id: number, data: Partial<Party>): Promise<Party> {
    const party = await this.findOne(id);
    Object.assign(party, data);
    return this.partiesRepository.save(party);
  }

  async remove(id: number): Promise<{ message: string }> {
    const party = await this.findOne(id);
    await this.partiesRepository.remove(party);
    return { message: 'Party deleted successfully' };
  }
}
