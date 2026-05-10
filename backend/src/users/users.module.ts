import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SeedService } from './seed.service';
import { ConstituenciesModule } from '../constituencies/constituencies.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConstituenciesModule],
  providers: [UsersService, SeedService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
