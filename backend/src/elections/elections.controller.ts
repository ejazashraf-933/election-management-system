import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateElectionDto } from './dto/create-election.dto';

const ADMIN_ROLES = [
  UserRole.ADMIN, UserRole.SUPERADMIN,
  UserRole.CHIEF_ELECTION_COMMISSIONER, UserRole.DISTRICT_RETURNING_OFFICER,
];

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionsController {
  constructor(private electionsService: ElectionsService) {}

  @Post()
  @Roles(...ADMIN_ROLES)
  create(@Body() dto: CreateElectionDto) {
    return this.electionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.electionsService.findAll();
  }

  @Get('running')
  findRunning() {
    return this.electionsService.findRunning();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.findOne(id);
  }

  @Put(':id')
  @Roles(...ADMIN_ROLES)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.electionsService.update(id, body);
  }

  @Put(':id/open-nominations')
  @Roles(...ADMIN_ROLES)
  openNominations(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.openNominations(id);
  }

  @Put(':id/close-nominations')
  @Roles(...ADMIN_ROLES)
  closeNominations(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.closeNominations(id);
  }

  @Put(':id/start')
  @Roles(...ADMIN_ROLES)
  start(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.start(id);
  }

  @Put(':id/pause')
  @Roles(...ADMIN_ROLES)
  pause(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.pause(id);
  }

  @Put(':id/start-counting')
  @Roles(...ADMIN_ROLES)
  startCounting(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.startCounting(id);
  }

  @Put(':id/end')
  @Roles(...ADMIN_ROLES)
  end(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.end(id);
  }
}
