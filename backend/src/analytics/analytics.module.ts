import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Vote } from '../votes/vote.entity';
import { User } from '../users/user.entity';
import { Election } from '../elections/election.entity';
import { Nomination } from '../nominations/nomination.entity';
import { PollingStation } from '../polling-stations/polling-station.entity';
import { Constituency } from '../constituencies/constituency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, User, Election, Nomination, PollingStation, Constituency])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
