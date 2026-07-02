import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../modules/users/users.module';
import { TicketsModule } from '../modules/tickets/tickets.module';

@Module({
  imports: [UsersModule, TicketsModule],
  providers: [SeedService],
})
export class SeedModule {}
