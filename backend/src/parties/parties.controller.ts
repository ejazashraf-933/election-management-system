import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PartiesService } from './parties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreatePartyDto } from './dto/create-party.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('parties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartiesController {
  constructor(
    private partiesService: PartiesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() dto: CreatePartyDto) {
    return this.partiesService.create(dto);
  }

  @Post(':id/logo')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.cloudinaryService.uploadFile(file, 'parties');
    return this.partiesService.update(id, { logo: url });
  }

  @Get()
  findAll() {
    return this.partiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partiesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.partiesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partiesService.remove(id);
  }
}
