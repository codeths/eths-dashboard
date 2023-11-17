import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'minutes',
  },
})
export class Event {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}
export const EventSchema = SchemaFactory.createForClass(Event);

@Schema({ _id: false })
class Metadata {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  device: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: string;
}
const MetadataSchema = SchemaFactory.createForClass(Metadata);

@Schema()
export class PingEventV1 extends Event {
  @Prop({ required: true, type: MetadataSchema })
  metadata: Metadata;

  @Prop({ required: true })
  ipAddress: string;
}
export const PingEventV1Schema = SchemaFactory.createForClass(PingEventV1);
export type PingEventV1Type = HydratedDocument<PingEventV1>;
