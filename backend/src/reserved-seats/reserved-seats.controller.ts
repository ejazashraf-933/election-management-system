import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReservedSeatsService } from './reserved-seats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('reserved-seats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservedSeatsController {
  constructor(private service: ReservedSeatsService) {}

  @Post('calculate/:electionId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.CHIEF_ELECTION_COMMISSIONER)
  calculateAllocation(
    @Param('electionId', ParseIntPipe) electionId: number,
    @Body() body: { partyVotes: { partyId: number; partyName: string; votes: number }[] },
  ) {
    return this.service.calculateAllocation(electionId, body.partyVotes);
  }

  @Get(':electionId')
  findByElection(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.findByElection(electionId);
  }
}
