import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constituency } from './constituency.entity';
import { ConstituenciesService } from './constituencies.service';
import { ConstituenciesController } from './constituencies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Constituency])],
  providers: [ConstituenciesService],
  controllers: [ConstituenciesController],
  exports: [ConstituenciesService],
})
export class ConstituenciesModule {}
