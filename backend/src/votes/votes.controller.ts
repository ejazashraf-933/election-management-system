import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('votes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Post()
  @Roles(UserRole.VOTER, UserRole.CANDIDATE)
  castVote(@Body() dto: CastVoteDto, @CurrentUser() user: any) {
    return this.votesService.castVote(user.id, dto.candidateId, dto.electionId);
  }

  @Get('results/:electionId')
  getResults(@Param('electionId', ParseIntPipe) electionId: number) {
    return this.votesService.getResults(electionId);
  }

  @Get('history')
  @Roles(UserRole.VOTER, UserRole.CANDIDATE)
  getVotingHistory(@CurrentUser() user: any) {
    return this.votesService.getVotingHistory(user.id);
  }
}
