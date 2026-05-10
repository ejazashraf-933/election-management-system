import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Party]), CloudinaryModule],
  providers: [PartiesService],
  controllers: [PartiesController],
  exports: [PartiesService],
})
export class PartiesModule {}
