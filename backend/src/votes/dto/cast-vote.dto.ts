import { IsInt } from 'class-validator';

export class CastVoteDto {
  @IsInt()
  candidateId: number;

  @IsInt()
  electionId: number;
}
