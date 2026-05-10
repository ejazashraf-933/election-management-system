import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { UsersModule } from '../users/users.module';
import { PartiesModule } from '../parties/parties.module';
import { ConstituenciesModule } from '../constituencies/constituencies.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
    UsersModule,
    PartiesModule,
    ConstituenciesModule,
    CloudinaryModule,
  ],
  providers: [CandidatesService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
