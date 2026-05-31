import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.CHIEF_ELECTION_COMMISSIONER)
export class AuditLogController {
  constructor(private service: AuditLogService) {}

  @Get()
  findAll(@Query('resource') resource?: string, @Query('limit') limit?: string) {
    return this.service.findAll(resource, limit ? +limit : 100);
  }
}
