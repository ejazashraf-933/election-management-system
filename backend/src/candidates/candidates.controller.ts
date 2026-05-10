import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.findOne(id);
  }
}
