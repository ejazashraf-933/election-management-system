import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nomination } from './nomination.entity';
import { NominationsService } from './nominations.service';
import { NominationsController } from './nominations.controller';
import { UsersModule } from '../users/users.module';
import { ElectionsModule } from '../elections/elections.module';
import { ConstituenciesModule } from '../constituencies/constituencies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Nomination]), UsersModule, ElectionsModule, ConstituenciesModule],
  providers: [NominationsService],
  controllers: [NominationsController],
  exports: [NominationsService],
})
export class NominationsModule {}
