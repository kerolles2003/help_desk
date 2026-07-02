import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TicketsService } from '../tickets/tickets.service';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const AUTHOR_POPULATE = {
  path: 'author',
  select: 'firstName lastName email role',
};

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly ticketsService: TicketsService,
  ) {}

  async list(ticketId: string, user: AuthenticatedUser) {
    // Reuse ticket access rules — throws if the caller can't view the ticket.
    await this.ticketsService.findOne(ticketId, user);

    const query: Record<string, unknown> = {
      ticket: new Types.ObjectId(ticketId),
    };
    // Employees never see internal notes.
    if (user.role === Role.EMPLOYEE) query.isInternal = false;

    return this.commentModel
      .find(query)
      .sort({ createdAt: 1 })
      .populate(AUTHOR_POPULATE);
  }

  async create(
    ticketId: string,
    dto: CreateCommentDto,
    user: AuthenticatedUser,
  ) {
    await this.ticketsService.findOne(ticketId, user);

    // Only staff may post internal notes.
    const isInternal =
      user.role !== Role.EMPLOYEE ? (dto.isInternal ?? false) : false;

    const created = await this.commentModel.create({
      ticket: new Types.ObjectId(ticketId),
      author: new Types.ObjectId(user.userId),
      content: dto.content,
      isInternal,
    });
    return created.populate(AUTHOR_POPULATE);
  }

  async update(commentId: string, content: string, user: AuthenticatedUser) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.toString() !== user.userId) {
      throw new ForbiddenException('You can only edit your own comment');
    }
    comment.content = content;
    await comment.save();
    return comment.populate(AUTHOR_POPULATE);
  }

  async remove(commentId: string, user: AuthenticatedUser) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const isAuthor = comment.author.toString() === user.userId;
    if (!isAuthor && user.role !== Role.MANAGER) {
      throw new ForbiddenException('You cannot delete this comment');
    }
    await comment.deleteOne();
    return { message: 'Comment deleted' };
  }
}
