import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollingAgent } from './polling-agent.entity';
import { CreatePollingAgentDto } from './dto/create-polling-agent.dto';
import { UsersService } from '../users/users.service';
import { NominationsService } from '../nominations/nominations.service';
import { PollingStationsService } from '../polling-stations/polling-stations.service';
import { ElectionsService } from '../elections/elections.service';

@Injectable()
export class PollingAgentsService {
  constructor(
    @InjectRepository(PollingAgent)
    private repo: Repository<PollingAgent>,
    private usersService: UsersService,
    private nominationsService: NominationsService,
    private pollingStationsService: PollingStationsService,
    private electionsService: ElectionsService,
  ) {}

  async create(dto: CreatePollingAgentDto): Promise<PollingAgent> {
    const agent = this.repo.create({ appointmentLetter: dto.appointmentLetter });
    agent.agent = await this.usersService.findById(dto.agentUserId);
    agent.nomination = await this.nominationsService.findOne(dto.nominationId);
    agent.pollingStation = await this.pollingStationsService.findOne(dto.pollingStationId);
    agent.election = await this.electionsService.findOne(dto.electionId);
    return this.repo.save(agent);
  }

  async findByElection(electionId: number): Promise<PollingAgent[]> {
    return this.repo.find({ where: { election: { id: electionId } }, order: { createdAt: 'DESC' } });
  }

  async findByPollingStation(stationId: number): Promise<PollingAgent[]> {
    return this.repo.find({ where: { pollingStation: { id: stationId } } });
  }

  async findOne(id: number): Promise<PollingAgent> {
    const agent = await this.repo.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Polling agent not found');
    return agent;
  }

  async deactivate(id: number): Promise<PollingAgent> {
    const agent = await this.findOne(id);
    agent.isActive = false;
    return this.repo.save(agent);
  }
}
