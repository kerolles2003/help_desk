import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.create(dto, user);
  }

  @Get()
  findAll(
    @Query() filter: FilterTicketsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findAll(filter, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPPORT, Role.MANAGER)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.updateStatus(id, dto.status, user);
  }

  @Patch(':id/assign')
  @Roles(Role.SUPPORT, Role.MANAGER)
  assign(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.assign(id, dto.assignedTo, user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ticketsService.remove(id);
  }
}
