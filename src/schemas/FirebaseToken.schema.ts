import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FirebaseTokenDocument = HydratedDocument<FirebaseToken>;

@Schema()
export class FirebaseToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  lastUsed: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  device: string;
}

export const FirebaseTokenSchema = SchemaFactory.createForClass(FirebaseToken);
