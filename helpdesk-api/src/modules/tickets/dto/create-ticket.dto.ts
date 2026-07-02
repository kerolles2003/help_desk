import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TicketPriority } from '../../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../../common/enums/ticket-category.enum';

export class CreateTicketDto {
  @ApiProperty({ minLength: 5, maxLength: 150 })
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title: string;

  @ApiProperty({ minLength: 10, maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  category: TicketCategory;
}
