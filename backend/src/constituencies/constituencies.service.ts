import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constituency } from './constituency.entity';

@Injectable()
export class ConstituenciesService {
  constructor(
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
  ) {}

  async create(data: Partial<Constituency>): Promise<Constituency> {
    const existing = await this.constituencyRepository.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('Constituency with this name already exists');
    const constituency = this.constituencyRepository.create(data);
    return this.constituencyRepository.save(constituency);
  }

  async findAll(): Promise<Constituency[]> {
    return this.constituencyRepository.find();
  }

  async findOne(id: number): Promise<Constituency> {
    const constituency = await this.constituencyRepository.findOne({ where: { id } });
    if (!constituency) throw new NotFoundException('Constituency not found');
    return constituency;
  }

  async update(id: number, data: Partial<Constituency>): Promise<Constituency> {
    const constituency = await this.findOne(id);
    Object.assign(constituency, data);
    return this.constituencyRepository.save(constituency);
  }

  async remove(id: number): Promise<{ message: string }> {
    const constituency = await this.findOne(id);
    await this.constituencyRepository.remove(constituency);
    return { message: 'Constituency deleted successfully' };
  }
}
