import { IsInt, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CandidateVoteDto {
  @IsInt()
  candidateId: number;

  @IsInt()
  @Min(0)
  votes: number;

  candidateName?: string;
  partyName?: string;
}

export class SubmitForm45Dto {
  @IsInt()
  electionId: number;

  @IsInt()
  @Min(0)
  totalRegisteredVoters: number;

  @IsInt()
  @Min(0)
  totalVotesCast: number;

  @IsInt()
  @Min(0)
  totalValidVotes: number;

  @IsInt()
  @Min(0)
  totalRejectedVotes: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateVoteDto)
  candidateVotes: CandidateVoteDto[];
}
