import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, Matches, IsBoolean, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{7}-\d$/, { message: 'CNIC must be in format XXXXX-XXXXXXX-X' })
  cnic?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  domicileDistrict?: string;

  @IsOptional()
  @IsBoolean()
  isAJKResident?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  constituencyId?: number;
}
