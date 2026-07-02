import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true })
  ticket: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  content: string;

  // When true, the comment is hidden from users with the `employee` role.
  @Prop({ required: true, default: false })
  isInternal: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes — fetch all comments of a ticket; list by author.
CommentSchema.index({ ticket: 1 });
CommentSchema.index({ author: 1 });
