import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { NominationsService } from './nominations.service';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { ScrutinizeNominationDto } from './dto/scrutinize-nomination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

const SCRUTINY_ROLES = [
  UserRole.ADMIN, UserRole.SUPERADMIN,
  UserRole.CHIEF_ELECTION_COMMISSIONER, UserRole.DISTRICT_RETURNING_OFFICER,
  UserRole.RETURNING_OFFICER,
];

@Controller('nominations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NominationsController {
  constructor(private service: NominationsService) {}

  @Post()
  @Roles(UserRole.VOTER, UserRole.CANDIDATE, ...SCRUTINY_ROLES)
  submit(@CurrentUser() user: any, @Body() dto: CreateNominationDto) {
    return this.service.submit(user.id, dto);
  }

  @Get()
  findAll(@Query('electionId') electionId?: string) {
    return this.service.findAll(electionId ? +electionId : undefined);
  }

  @Get('stats/:electionId')
  @Roles(...SCRUTINY_ROLES)
  getStats(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.getStats(electionId);
  }

  @Get('constituency/:constituencyId/election/:electionId')
  findByConstituency(
    @Param('constituencyId', ParseIntPipe) constituencyId: number,
    @Param('electionId', ParseIntPipe) electionId: number,
  ) {
    return this.service.findByConstituency(constituencyId, electionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id/scrutinize')
  @Roles(...SCRUTINY_ROLES)
  scrutinize(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: ScrutinizeNominationDto,
  ) {
    return this.service.scrutinize(id, user.id, dto);
  }

  @Put(':id/withdraw')
  @Roles(UserRole.VOTER, UserRole.CANDIDATE)
  withdraw(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.withdraw(id, user.id);
  }

  @Put(':id/appeal')
  @Roles(UserRole.VOTER, UserRole.CANDIDATE)
  appeal(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.appeal(id, user.id);
  }
}
