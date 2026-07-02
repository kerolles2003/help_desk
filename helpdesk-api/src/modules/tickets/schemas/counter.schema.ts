import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

/**
 * Atomic sequence generator used to produce gap-free, collision-free
 * ticket numbers via findOneAndUpdate + $inc with upsert.
 */
@Schema({ collection: 'counters' })
export class Counter {
  // _id holds the sequence name (e.g. 'ticketNumber'); Mongo's default
  // _id index already enforces uniqueness — no extra index needed.
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
