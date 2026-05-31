import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ElectionPhasesService } from './election-phases.service';
import { CreateElectionPhaseDto } from './dto/create-election-phase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

const MANAGE_ROLES = [
  UserRole.ADMIN, UserRole.SUPERADMIN,
  UserRole.CHIEF_ELECTION_COMMISSIONER, UserRole.DISTRICT_RETURNING_OFFICER,
];

@Controller('election-phases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionPhasesController {
  constructor(private service: ElectionPhasesService) {}

  @Post()
  @Roles(...MANAGE_ROLES)
  create(@Body() dto: CreateElectionPhaseDto) {
    return this.service.create(dto);
  }

  @Get('election/:electionId')
  findByElection(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.findByElection(electionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id/start')
  @Roles(...MANAGE_ROLES)
  startPhase(@Param('id', ParseIntPipe) id: number) {
    return this.service.startPhase(id);
  }

  @Put(':id/end')
  @Roles(...MANAGE_ROLES)
  endPhase(@Param('id', ParseIntPipe) id: number) {
    return this.service.endPhase(id);
  }

  @Put(':id/complete')
  @Roles(...MANAGE_ROLES)
  completePhase(@Param('id', ParseIntPipe) id: number) {
    return this.service.completePhase(id);
  }
}
