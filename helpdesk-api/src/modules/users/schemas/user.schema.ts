import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      // Never leak the password hash in serialized output.
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Excluded from query results by default; select('+password') to include.
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes — `email` already unique via @Prop; add role for filtered listings.
UserSchema.index({ role: 1 });
