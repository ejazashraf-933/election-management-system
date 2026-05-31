import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { PartiesModule } from './parties/parties.module';
import { ConstituenciesModule } from './constituencies/constituencies.module';
import { CandidatesModule } from './candidates/candidates.module';
import { ElectionsModule } from './elections/elections.module';
import { VotesModule } from './votes/votes.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PollingStationsModule } from './polling-stations/polling-stations.module';
import { NominationsModule } from './nominations/nominations.module';
import { ElectionPhasesModule } from './election-phases/election-phases.module';
import { Form45Module } from './form45/form45.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { PollingAgentsModule } from './polling-agents/polling-agents.module';
import { ReservedSeatsModule } from './reserved-seats/reserved-seats.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { loggerConfig } from './common/logger.config';
import { LoggingInterceptor } from './common/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
        ? { rejectUnauthorized: false }
        : false,
    }),
    AuthModule,
    PartiesModule,
    ConstituenciesModule,
    CandidatesModule,
    ElectionsModule,
    VotesModule,
    CloudinaryModule,
    PollingStationsModule,
    NominationsModule,
    ElectionPhasesModule,
    Form45Module,
    AuditLogModule,
    PollingAgentsModule,
    ReservedSeatsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor],
})
export class AppModule {}
