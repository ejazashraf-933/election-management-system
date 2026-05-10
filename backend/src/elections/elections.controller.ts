import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateElectionDto } from './dto/create-election.dto';

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionsController {
  constructor(private electionsService: ElectionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() dto: CreateElectionDto) {
    return this.electionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.electionsService.findAll();
  }

  @Get('running')
  findRunning() {
    return this.electionsService.findRunning();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.electionsService.update(id, body);
  }

  @Put(':id/start')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  start(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.start(id);
  }

  @Put(':id/pause')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  pause(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.pause(id);
  }

  @Put(':id/end')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  end(@Param('id', ParseIntPipe) id: number) {
    return this.electionsService.end(id);
  }
}
