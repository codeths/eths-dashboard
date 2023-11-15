import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class ExtUser {
  @Prop({ required: true, index: { unique: true } })
  googleID: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop()
  name?: string;
}

export const ExtUserSchema = SchemaFactory.createForClass(ExtUser);
export type ExtUserDocument = HydratedDocument<ExtUser>;
