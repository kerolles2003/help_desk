import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../../common/enums/ticket-category.enum';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true, unique: true })
  ticketNumber: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({
    required: true,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Prop({
    required: true,
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Prop({ required: true, enum: TicketCategory })
  category: TicketCategory;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, immutable: true })
  submittedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Indexes — `ticketNumber` already unique via @Prop.
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ submittedBy: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdAt: -1 });
// Compound index supporting the default support-queue sort.
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
