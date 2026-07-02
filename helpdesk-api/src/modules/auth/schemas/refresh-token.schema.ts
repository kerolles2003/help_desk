import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // SHA-256 hash of the refresh token — raw token is never persisted.
  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// `tokenHash` already unique via @Prop.
RefreshTokenSchema.index({ user: 1 });
// TTL index — MongoDB auto-deletes documents once expiresAt passes.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
