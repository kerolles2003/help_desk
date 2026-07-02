import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService, MongooseModule],
})
export class TicketsModule {}
