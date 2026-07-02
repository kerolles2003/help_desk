import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    TicketsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [MongooseModule],
})
export class CommentsModule {}
