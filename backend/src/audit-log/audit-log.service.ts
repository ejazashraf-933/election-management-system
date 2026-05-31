import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
  ) {}

  async log(params: {
    actorId?: number;
    action: string;
    resource: string;
    resourceId?: string | number;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const entry = this.repo.create({
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId?.toString(),
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    if (params.actorId) {
      entry.actor = { id: params.actorId } as any;
    }
    await this.repo.save(entry);
  }

  async findAll(resource?: string, limit = 100) {
    const query = this.repo.createQueryBuilder('log')
      .leftJoinAndSelect('log.actor', 'actor')
      .orderBy('log.createdAt', 'DESC')
      .take(limit);

    if (resource) {
      query.where('log.resource = :resource', { resource });
    }

    return query.getMany();
  }

  async findByResource(resource: string, resourceId: string) {
    return this.repo.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
    });
  }
}
