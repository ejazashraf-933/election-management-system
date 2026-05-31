import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.service.getDashboardStats();
  }

  @Get('turnout/:electionId')
  getVoterTurnout(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.getVoterTurnout(electionId);
  }

  @Get('party-results/:electionId')
  getPartyWiseResults(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.getPartyWiseResults(electionId);
  }

  @Get('constituency-winners/:electionId')
  getConstituencyWiseWinners(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.service.getConstituencyWiseWinners(electionId);
  }
}
