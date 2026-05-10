import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { ConstituenciesService } from '../constituencies/constituencies.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private constituenciesService: ConstituenciesService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(u => {
      const { password, ...safe } = u as any;
      return safe;
    });
  }

  async create(data: Partial<User>, constituencyId?: number): Promise<User> {
    const user = this.usersRepository.create(data);
    if (constituencyId) {
      user.constituency = await this.constituenciesService.findOne(constituencyId);
    }
    return this.usersRepository.save(user);
  }

  async updateConstituency(id: number, constituencyId: number) {
    const user = await this.findById(id);
    user.constituency = await this.constituenciesService.findOne(constituencyId);
    const saved = await this.usersRepository.save(user);
    const { password, ...safe } = saved as any;
    return safe;
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.usersRepository.save(user);
  }
}
