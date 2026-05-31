import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Form45Service } from './form45.service';
import { SubmitForm45Dto } from './dto/submit-form45.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('form45')
@UseGuards(JwtAuthGuard, RolesGuard)
export class Form45Controller {
  constructor(private service: Form45Service) {}

  @Post('polling-station/:stationId')
  @Roles(
    UserRole.PRESIDING_OFFICER, UserRole.ADMIN, UserRole.SUPERADMIN,
    UserRole.CHIEF_ELECTION_COMMISSIONER, UserRole.RETURNING_OFFICER,
  )
  submit(
    @Param('stationId', ParseIntPipe) stationId: number,
    @CurrentUser() user: any,
    @Body() dto: SubmitForm45Dto,
  ) {
    return this.service.submit(stationId, user.id, dto);
  }

  @Get('election/:electionId')
  findByElection(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.findByElection(electionId);
  }

  @Get('election/:electionId/consolidated')
  getConsolidatedResults(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.getConsolidatedResults(electionId);
  }

  @Get('polling-station/:stationId')
  findByPollingStation(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.service.findByPollingStation(stationId);
  }
}
