import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionPhase } from './election-phase.entity';
import { ElectionPhasesService } from './election-phases.service';
import { ElectionPhasesController } from './election-phases.controller';
import { ElectionsModule } from '../elections/elections.module';
import { ConstituenciesModule } from '../constituencies/constituencies.module';

@Module({
  imports: [TypeOrmModule.forFeature([ElectionPhase]), ElectionsModule, ConstituenciesModule],
  providers: [ElectionPhasesService],
  controllers: [ElectionPhasesController],
  exports: [ElectionPhasesService],
})
export class ElectionPhasesModule {}
