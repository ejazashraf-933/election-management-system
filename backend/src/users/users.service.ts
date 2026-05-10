import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
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

  async create(data: Partial<User>, constituencyId?: number): Promise<User> {
    const user = this.usersRepository.create(data);
    if (constituencyId) {
      user.constituency = await this.constituenciesService.findOne(constituencyId);
    }
    return this.usersRepository.save(user);
  }
}
