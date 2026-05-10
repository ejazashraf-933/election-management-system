import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ConstituenciesService } from './constituencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateConstituencyDto } from './dto/create-constituency.dto';

@Controller('constituencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConstituenciesController {
  constructor(private constituenciesService: ConstituenciesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() dto: CreateConstituencyDto) {
    return this.constituenciesService.create(dto);
  }

  @Get()
  findAll() {
    return this.constituenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.constituenciesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.constituenciesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.constituenciesService.remove(id);
  }
}
