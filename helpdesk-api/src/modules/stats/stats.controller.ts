import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @Roles(Role.MANAGER)
  overview() {
    return this.statsService.overview();
  }

  @Get('by-priority')
  @Roles(Role.SUPPORT, Role.MANAGER)
  byPriority() {
    return this.statsService.byPriority();
  }

  @Get('by-agent')
  @Roles(Role.MANAGER)
  byAgent() {
    return this.statsService.byAgent();
  }

  @Get('trends')
  @Roles(Role.MANAGER)
  trends() {
    return this.statsService.trends();
  }
}
