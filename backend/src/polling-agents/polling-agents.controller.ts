import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PollingAgentsService } from './polling-agents.service';
import { CreatePollingAgentDto } from './dto/create-polling-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('polling-agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PollingAgentsController {
  constructor(private service: PollingAgentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.RETURNING_OFFICER, UserRole.CHIEF_ELECTION_COMMISSIONER)
  create(@Body() dto: CreatePollingAgentDto) {
    return this.service.create(dto);
  }

  @Get('election/:electionId')
  findByElection(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.findByElection(electionId);
  }

  @Get('station/:stationId')
  findByPollingStation(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.service.findByPollingStation(stationId);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.RETURNING_OFFICER)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }
}
