import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, VoterStatus } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.CHIEF_ELECTION_COMMISSIONER)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  @Get('constituency/:id')
  findByConstituency(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findByConstituency(id);
  }

  @Patch(':id/constituency')
  updateConstituency(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { constituencyId: number },
  ) {
    return this.usersService.updateConstituency(id, body.constituencyId);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(':id/voter-status')
  updateVoterStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: VoterStatus },
  ) {
    return this.usersService.updateVoterStatus(id, body.status);
  }
}
