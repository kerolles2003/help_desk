import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketPriority } from '../../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../../common/enums/ticket-category.enum';

export class UpdateTicketDto {
  @ApiPropertyOptional({ minLength: 5, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ minLength: 10, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;
}
