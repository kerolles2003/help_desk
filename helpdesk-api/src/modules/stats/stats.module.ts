import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TicketsModule, UsersModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
