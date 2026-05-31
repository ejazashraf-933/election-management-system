import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollingStation, PollingStationStatus } from './polling-station.entity';
import { CreatePollingStationDto } from './dto/create-polling-station.dto';
import { ConstituenciesService } from '../constituencies/constituencies.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PollingStationsService {
  constructor(
    @InjectRepository(PollingStation)
    private repo: Repository<PollingStation>,
    private constituenciesService: ConstituenciesService,
    private usersService: UsersService,
  ) {}

  async create(dto: CreatePollingStationDto): Promise<PollingStation> {
    const station = this.repo.create({
      name: dto.name,
      address: dto.address,
      code: dto.code,
      totalRegisteredVoters: dto.totalRegisteredVoters ?? 0,
    });
    station.constituency = await this.constituenciesService.findOne(dto.constituencyId);
    if (dto.presidingOfficerId) {
      station.presidingOfficer = await this.usersService.findById(dto.presidingOfficerId);
    }
    return this.repo.save(station);
  }

  async findAll(): Promise<PollingStation[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByConstituency(constituencyId: number): Promise<PollingStation[]> {
    return this.repo.find({ where: { constituency: { id: constituencyId } } });
  }

  async findOne(id: number): Promise<PollingStation> {
    const station = await this.repo.findOne({ where: { id } });
    if (!station) throw new NotFoundException('Polling station not found');
    return station;
  }

  async open(id: number): Promise<PollingStation> {
    const station = await this.findOne(id);
    if (station.status !== PollingStationStatus.SETUP) {
      throw new BadRequestException('Station is already open or closed');
    }
    station.status = PollingStationStatus.OPEN;
    station.openedAt = new Date();
    return this.repo.save(station);
  }

  async close(id: number): Promise<PollingStation> {
    const station = await this.findOne(id);
    if (station.status !== PollingStationStatus.OPEN) {
      throw new BadRequestException('Station is not open');
    }
    station.status = PollingStationStatus.CLOSED;
    station.closedAt = new Date();
    return this.repo.save(station);
  }

  async update(id: number, data: Partial<PollingStation>): Promise<PollingStation> {
    const station = await this.findOne(id);
    Object.assign(station, data);
    return this.repo.save(station);
  }

  async remove(id: number): Promise<{ message: string }> {
    const station = await this.findOne(id);
    await this.repo.remove(station);
    return { message: 'Polling station deleted successfully' };
  }

  async getStats() {
    const total = await this.repo.count();
    const open = await this.repo.count({ where: { status: PollingStationStatus.OPEN } });
    const closed = await this.repo.count({ where: { status: PollingStationStatus.CLOSED } });
    const submitted = await this.repo.count({ where: { status: PollingStationStatus.RESULTS_SUBMITTED } });
    return { total, open, closed, resultsSubmitted: submitted };
  }
}
