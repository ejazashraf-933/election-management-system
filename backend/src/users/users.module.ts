import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { SeedService } from './seed.service';
import { ConstituenciesModule } from '../constituencies/constituencies.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConstituenciesModule],
  providers: [UsersService, SeedService],
  exports: [UsersService],
})
export class UsersModule {}
