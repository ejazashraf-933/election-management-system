import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form45 } from './form45.entity';
import { Form45Service } from './form45.service';
import { Form45Controller } from './form45.controller';
import { PollingStationsModule } from '../polling-stations/polling-stations.module';
import { ElectionsModule } from '../elections/elections.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Form45]), PollingStationsModule, ElectionsModule, CandidatesModule, UsersModule],
  providers: [Form45Service],
  controllers: [Form45Controller],
  exports: [Form45Service],
})
export class Form45Module {}
