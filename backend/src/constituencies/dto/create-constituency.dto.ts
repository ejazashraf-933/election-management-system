import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ConstituencyType, SeatType } from '../constituency.entity';

export class CreateConstituencyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ConstituencyType)
  type?: ConstituencyType;

  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @IsOptional()
  @IsString()
  seatNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalRegisteredVoters?: number;
}
