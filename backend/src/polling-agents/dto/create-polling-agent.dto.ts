import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePollingAgentDto {
  @IsInt()
  agentUserId: number;

  @IsInt()
  nominationId: number;

  @IsInt()
  pollingStationId: number;

  @IsInt()
  electionId: number;

  @IsOptional()
  @IsString()
  appointmentLetter?: string;
}
