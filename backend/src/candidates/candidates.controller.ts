import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(
    private candidatesService: CandidatesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Voter self-registers as a candidate
  @Post('self')
  @Roles(UserRole.VOTER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('photo'))
  async selfRegister(
    @CurrentUser() user: any,
    @Body('constituencyId') constituencyId: string,
    @Body('partyId') partyId: string,
    @Body('isIndependent') isIndependent: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const candidate = await this.candidatesService.create(
      user.id,
      Number(constituencyId),
      partyId ? Number(partyId) : undefined,
      isIndependent === 'true',
    );
    if (file) {
      const url = await this.cloudinaryService.uploadFile(file, 'candidates');
      return this.candidatesService.updatePhoto(candidate.id, url);
    }
    return candidate;
  }

  // Admin registers a candidate on behalf of a user
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(
      dto.userId,
      dto.constituencyId,
      dto.partyId,
      dto.isIndependent,
    );
  }

  @Post(':id/photo')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.CANDIDATE)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.cloudinaryService.uploadFile(file, 'candidates');
    return this.candidatesService.updatePhoto(id, url);
  }

  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get('me')
  @Roles(UserRole.CANDIDATE)
  getMyProfile(@CurrentUser() user: any) {
    return this.candidatesService.findByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.findOne(id);
  }
}
