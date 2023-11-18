import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Device } from './Device.schema';

export type FirebaseTokenDocument = HydratedDocument<FirebaseToken>;

@Schema()
export class FirebaseToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  lastUsed: Date;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Device.name,
  })
  device: string;
}

export const FirebaseTokenSchema = SchemaFactory.createForClass(FirebaseToken);
