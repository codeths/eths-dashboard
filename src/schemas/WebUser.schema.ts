import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class WebUser {
  @Prop({ required: true, index: { unique: true } })
  googleID: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  photo?: string;
}

export const WebUserSchema = SchemaFactory.createForClass(WebUser);
export type WebUserDocument = HydratedDocument<WebUser>;
