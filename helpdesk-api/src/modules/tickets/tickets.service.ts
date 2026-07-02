import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Counter, CounterDocument } from './schemas/counter.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const POPULATE = [
  { path: 'submittedBy', select: 'firstName lastName email role' },
  { path: 'assignedTo', select: 'firstName lastName email role' },
];

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
    private readonly usersService: UsersService,
  ) {}

  private async nextTicketNumber(): Promise<string> {
    const counter = await this.counterModel.findByIdAndUpdate(
      'ticketNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return `TKT-${String(counter.seq).padStart(5, '0')}`;
  }

  async create(dto: CreateTicketDto, user: AuthenticatedUser) {
    const ticketNumber = await this.nextTicketNumber();
    const created = await this.ticketModel.create({
      ...dto,
      ticketNumber,
      submittedBy: new Types.ObjectId(user.userId),
    });
    return this.ticketModel.findById(created.id).populate(POPULATE);
  }

  async findAll(filter: FilterTicketsDto, user: AuthenticatedUser) {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const query: Record<string, unknown> = {};

    // Employees only ever see the tickets they submitted.
    if (user.role === Role.EMPLOYEE) {
      query.submittedBy = new Types.ObjectId(user.userId);
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    if (assignedTo) {
      const id = assignedTo === 'me' ? user.userId : assignedTo;
      if (Types.ObjectId.isValid(id)) query.assignedTo = new Types.ObjectId(id);
    }

    if (search) {
      const rx = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: rx }, { description: rx }, { ticketNumber: rx }];
    }

    const [data, total] = await Promise.all([
      this.ticketModel
        .find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(POPULATE),
      this.ticketModel.countDocuments(query),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const ticket = await this.ticketModel.findById(id).populate(POPULATE);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertCanView(ticket, user);
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate(POPULATE);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus, user: AuthenticatedUser) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const isStaff = user.role !== Role.EMPLOYEE;
    const isOwner = ticket.submittedBy.toString() === user.userId;
    // Employees may only close their own ticket; staff can set any status.
    if (!isStaff && !(isOwner && status === TicketStatus.CLOSED)) {
      throw new ForbiddenException(
        'You can only close your own ticket',
      );
    }

    ticket.status = status;
    ticket.resolvedAt = status === TicketStatus.RESOLVED ? new Date() : null;
    ticket.closedAt = status === TicketStatus.CLOSED ? new Date() : null;
    await ticket.save();
    return ticket.populate(POPULATE);
  }

  async assign(id: string, assignedTo: string | null, user: AuthenticatedUser) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Support agents can only assign tickets to themselves.
    if (user.role === Role.SUPPORT && assignedTo && assignedTo !== user.userId) {
      throw new ForbiddenException('Support agents can only self-assign');
    }

    if (assignedTo) {
      const agent = await this.usersService.findById(assignedTo);
      if (agent.role === Role.EMPLOYEE) {
        throw new BadRequestException(
          'Tickets can only be assigned to support agents or managers',
        );
      }
      ticket.assignedTo = new Types.ObjectId(assignedTo);
    } else {
      ticket.assignedTo = null;
    }

    await ticket.save();
    return ticket.populate(POPULATE);
  }

  async remove(id: string) {
    const deleted = await this.ticketModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Ticket not found');
    return { message: 'Ticket deleted' };
  }

  private assertCanView(ticket: TicketDocument, user: AuthenticatedUser) {
    if (user.role !== Role.EMPLOYEE) return;
    // submittedBy may be populated (object with _id) or a raw ObjectId.
    const submittedBy = ticket.submittedBy as unknown as {
      _id?: Types.ObjectId;
    };
    const ownerId = String(submittedBy._id ?? ticket.submittedBy);
    if (ownerId !== user.userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
