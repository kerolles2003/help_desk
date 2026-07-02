import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
    private readonly usersService: UsersService,
  ) {}

  async overview() {
    const rows = await this.ticketModel.aggregate<{
      _id: TicketStatus;
      count: number;
    }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    const open = byStatus[TicketStatus.OPEN] ?? 0;
    const inProgress = byStatus[TicketStatus.IN_PROGRESS] ?? 0;
    const resolved = byStatus[TicketStatus.RESOLVED] ?? 0;
    const closed = byStatus[TicketStatus.CLOSED] ?? 0;

    return {
      open,
      inProgress,
      resolved,
      closed,
      total: open + inProgress + resolved + closed,
    };
  }

  async byPriority() {
    const rows = await this.ticketModel.aggregate<{
      _id: TicketPriority;
      count: number;
    }>([{ $group: { _id: '$priority', count: { $sum: 1 } } }]);

    const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    return {
      low: map[TicketPriority.LOW] ?? 0,
      medium: map[TicketPriority.MEDIUM] ?? 0,
      high: map[TicketPriority.HIGH] ?? 0,
      critical: map[TicketPriority.CRITICAL] ?? 0,
    };
  }

  async byAgent() {
    const rows = await this.ticketModel.aggregate<{
      _id: unknown;
      open: number;
      inProgress: number;
      resolved: number;
    }>([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          open: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.OPEN] }, 1, 0] },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', TicketStatus.IN_PROGRESS] }, 1, 0],
            },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.RESOLVED] }, 1, 0] },
          },
        },
      },
    ]);

    const agents = await this.usersService.findAgents();
    const byId = new Map(rows.map((r) => [String(r._id), r]));

    return agents.map((agent) => {
      const counts = byId.get(agent.id);
      return {
        agent: agent.toJSON(),
        open: counts?.open ?? 0,
        inProgress: counts?.inProgress ?? 0,
        resolved: counts?.resolved ?? 0,
      };
    });
  }

  async trends() {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const rows = await this.ticketModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map((r) => ({ date: r._id, count: r.count }));
  }
}
