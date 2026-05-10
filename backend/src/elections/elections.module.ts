import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from './election.entity';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Election])],
  providers: [ElectionsService],
  controllers: [ElectionsController],
  exports: [ElectionsService],
})
export class ElectionsModule {}
