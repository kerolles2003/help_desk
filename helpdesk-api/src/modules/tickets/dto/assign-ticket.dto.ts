import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, ValidateIf } from 'class-validator';

export class AssignTicketDto {
  @ApiPropertyOptional({
    description: 'User id of a support agent/manager, or null to unassign',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsMongoId()
  assignedTo: string | null;
}
