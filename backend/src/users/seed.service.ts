import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const existing = await this.usersRepository.findOne({
      where: { role: UserRole.SUPERADMIN },
    });

    if (!existing) {
      const hashed = await bcrypt.hash('superadmin123', 10);
      const superAdmin = this.usersRepository.create({
        name: 'Super Admin',
        email: 'superadmin@ems.com',
        password: hashed,
        role: UserRole.SUPERADMIN,
      });
      await this.usersRepository.save(superAdmin);
      console.log('SuperAdmin seeded: superadmin@ems.com / superadmin123');
    }
  }
}
