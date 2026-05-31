import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollingStation } from './polling-station.entity';
import { PollingStationsService } from './polling-stations.service';
import { PollingStationsController } from './polling-stations.controller';
import { ConstituenciesModule } from '../constituencies/constituencies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PollingStation]), ConstituenciesModule, UsersModule],
  providers: [PollingStationsService],
  controllers: [PollingStationsController],
  exports: [PollingStationsService],
})
export class PollingStationsModule {}
