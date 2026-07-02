import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { TicketsService } from '../modules/tickets/tickets.service';
import { Role } from '../common/enums/role.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';
import { TicketCategory } from '../common/enums/ticket-category.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { AuthenticatedUser } from '../modules/auth/interfaces/jwt-payload.interface';

const DEMO_PASSWORD = 'password123';

const DEMO_USERS = [
  { email: 'employee@demo.io', firstName: 'Emma', lastName: 'Employee', role: Role.EMPLOYEE },
  { email: 'support@demo.io', firstName: 'Sam', lastName: 'Support', role: Role.SUPPORT },
  { email: 'manager@demo.io', firstName: 'Mia', lastName: 'Manager', role: Role.MANAGER },
];

/**
 * Seeds demo accounts and sample tickets on every boot.
 *
 * The prototype uses an in-memory database that resets on restart, so this
 * runs each start (guarded by a user-count check for safety against real DBs).
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly usersService: UsersService,
    private readonly ticketsService: TicketsService,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.usersService.count();
    if (existing > 0) {
      this.logger.log('Users already present — skipping seed');
      return;
    }

    const created = await Promise.all(
      DEMO_USERS.map((u) =>
        this.usersService.create({ ...u, password: DEMO_PASSWORD }),
      ),
    );
    const [employee, support] = created;

    const asEmployee: AuthenticatedUser = {
      userId: employee.id,
      email: employee.email,
      role: employee.role,
    };
    const asSupport: AuthenticatedUser = {
      userId: support.id,
      email: support.email,
      role: support.role,
    };

    const samples = [
      {
        title: 'Laptop will not connect to office Wi-Fi',
        description:
          'Since this morning my laptop cannot join the corporate Wi-Fi network. Ethernet works fine.',
        priority: TicketPriority.HIGH,
        category: TicketCategory.IT,
      },
      {
        title: 'Request new monitor for standing desk',
        description:
          'I would like to request a second 27-inch monitor for my new standing desk setup.',
        priority: TicketPriority.LOW,
        category: TicketCategory.FACILITIES,
      },
      {
        title: 'Payroll deduction looks incorrect this month',
        description:
          'The health-insurance deduction on my latest payslip is higher than usual. Please review.',
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.FINANCE,
      },
    ];

    const tickets = await Promise.all(
      samples.map((s) => this.ticketsService.create(s, asEmployee)),
    );

    // Give the queue some life: assign + progress the first ticket.
    if (tickets[0]) {
      await this.ticketsService.assign(tickets[0].id, support.id, asSupport);
      await this.ticketsService.updateStatus(
        tickets[0].id,
        TicketStatus.IN_PROGRESS,
        asSupport,
      );
    }

    this.logger.log(
      `Seeded ${created.length} demo users and ${tickets.length} tickets`,
    );
    this.logger.log(
      `Demo logins (password: ${DEMO_PASSWORD}): ${DEMO_USERS.map((u) => u.email).join(', ')}`,
    );
  }
}
