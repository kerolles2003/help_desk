import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Role } from '../../common/enums/role.enum';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email }).lean();
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const created = await this.userModel.create({ ...dto, password });
    return this.findById(created.id);
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 20, role, isActive } = query;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** All support agents + managers — used for assignee pickers and stats. */
  findAgents(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: { $in: [Role.SUPPORT, Role.MANAGER] }, isActive: true })
      .sort({ firstName: 1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Includes the password hash — for authentication only. */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) throw new NotFoundException('User not found');

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
  }

  /** Verify a plaintext password against a stored user document. */
  comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }
}
