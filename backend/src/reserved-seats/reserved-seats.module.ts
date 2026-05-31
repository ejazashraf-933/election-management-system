import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservedSeat } from './reserved-seat.entity';
import { ReservedSeatsService } from './reserved-seats.service';
import { ReservedSeatsController } from './reserved-seats.controller';
import { ElectionsModule } from '../elections/elections.module';
import { ConstituenciesModule } from '../constituencies/constituencies.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReservedSeat]), ElectionsModule, ConstituenciesModule],
  providers: [ReservedSeatsService],
  controllers: [ReservedSeatsController],
  exports: [ReservedSeatsService],
})
export class ReservedSeatsModule {}
