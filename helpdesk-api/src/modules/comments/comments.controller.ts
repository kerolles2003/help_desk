import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  list(
    @Param('ticketId', ParseObjectIdPipe) ticketId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.list(ticketId, user);
  }

  @Post()
  create(
    @Param('ticketId', ParseObjectIdPipe) ticketId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.create(ticketId, dto, user);
  }

  @Patch(':commentId')
  update(
    @Param('commentId', ParseObjectIdPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.update(commentId, dto.content, user);
  }

  @Delete(':commentId')
  remove(
    @Param('commentId', ParseObjectIdPipe) commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.remove(commentId, user);
  }
}
