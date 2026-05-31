import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, VoterStatus } from './user.entity';
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

  async findByCnic(cnic: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cnic } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find({ relations: ['constituency'] });
    return users.map(u => {
      const { password, ...safe } = u as any;
      return safe;
    });
  }

  async findByConstituency(constituencyId: number) {
    const users = await this.usersRepository.find({
      where: { constituency: { id: constituencyId } },
      relations: ['constituency'],
    });
    return users.map(u => { const { password, ...safe } = u as any; return safe; });
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

  async updateVoterStatus(id: number, status: VoterStatus): Promise<User> {
    const user = await this.findById(id);
    user.voterStatus = status;
    return this.usersRepository.save(user);
  }

  async getStats() {
    const total = await this.usersRepository.count();
    const voters = await this.usersRepository.count({ where: { role: UserRole.VOTER } });
    const candidates = await this.usersRepository.count({ where: { role: UserRole.CANDIDATE } });
    const admins = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    return { total, voters, candidates, admins };
  }
}
