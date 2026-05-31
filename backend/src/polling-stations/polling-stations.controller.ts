import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { PollingStationsService } from './polling-stations.service';
import { CreatePollingStationDto } from './dto/create-polling-station.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

const MANAGE_ROLES = [
  UserRole.ADMIN, UserRole.SUPERADMIN,
  UserRole.CHIEF_ELECTION_COMMISSIONER, UserRole.DISTRICT_RETURNING_OFFICER,
  UserRole.RETURNING_OFFICER,
];

@Controller('polling-stations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PollingStationsController {
  constructor(private service: PollingStationsService) {}

  @Post()
  @Roles(...MANAGE_ROLES)
  create(@Body() dto: CreatePollingStationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('constituencyId') constituencyId?: string) {
    if (constituencyId) return this.service.findByConstituency(+constituencyId);
    return this.service.findAll();
  }

  @Get('stats')
  @Roles(...MANAGE_ROLES)
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(...MANAGE_ROLES)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Put(':id/open')
  @Roles(...MANAGE_ROLES, UserRole.PRESIDING_OFFICER)
  open(@Param('id', ParseIntPipe) id: number) {
    return this.service.open(id);
  }

  @Put(':id/close')
  @Roles(...MANAGE_ROLES, UserRole.PRESIDING_OFFICER)
  close(@Param('id', ParseIntPipe) id: number) {
    return this.service.close(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
