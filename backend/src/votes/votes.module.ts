import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { ElectionsModule } from '../elections/elections.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    ElectionsModule,
    CandidatesModule,
    UsersModule,
  ],
  providers: [VotesService],
  controllers: [VotesController],
})
export class VotesModule {}
