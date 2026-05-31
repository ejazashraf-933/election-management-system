import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollingAgent } from './polling-agent.entity';
import { PollingAgentsService } from './polling-agents.service';
import { PollingAgentsController } from './polling-agents.controller';
import { UsersModule } from '../users/users.module';
import { NominationsModule } from '../nominations/nominations.module';
import { PollingStationsModule } from '../polling-stations/polling-stations.module';
import { ElectionsModule } from '../elections/elections.module';

@Module({
  imports: [TypeOrmModule.forFeature([PollingAgent]), UsersModule, NominationsModule, PollingStationsModule, ElectionsModule],
  providers: [PollingAgentsService],
  controllers: [PollingAgentsController],
  exports: [PollingAgentsService],
})
export class PollingAgentsModule {}
