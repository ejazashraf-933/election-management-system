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
import { loggerConfig } from './common/logger.config';
import { LoggingInterceptor } from './common/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(loggerConfig),
    AuthModule,
    PartiesModule,
    ConstituenciesModule,
    CandidatesModule,
    ElectionsModule,
    VotesModule,
    CloudinaryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'election_db',
      password: '12345',
      database: 'election_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor],
})
export class AppModule {}
