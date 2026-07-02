import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.MANAGER)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  /** Assignable agents (support + manager) — available to staff for pickers. */
  @Get('agents')
  @Roles(Role.SUPPORT, Role.MANAGER)
  findAgents() {
    return this.usersService.findAgents();
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.userId);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'Password updated' };
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
}
