import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../../common/enums/ticket-category.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterTicketsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({ description: 'Agent user id, or "me" for the caller' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Keyword match on title/description/number' })
  @IsOptional()
  @IsString()
  search?: string;
}
