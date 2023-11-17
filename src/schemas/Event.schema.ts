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

@Schema()
class NetworkEvent extends Event {
  @Prop({ required: true })
  ipAddress: string;
}

@Schema({ _id: false })
class PingMetadata {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  device: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: string;
}
const PingMetadataSchema = SchemaFactory.createForClass(PingMetadata);

@Schema()
export class PingEventV1 extends NetworkEvent {
  @Prop({ required: true, type: PingMetadataSchema })
  metadata: PingMetadata;
}
export const PingEventV1Schema = SchemaFactory.createForClass(PingEventV1);
export type PingEventV1Type = HydratedDocument<PingEventV1>;

@Schema()
export class RegistrationEventV1 extends NetworkEvent {
  @Prop({ required: true, type: PingMetadataSchema })
  metadata: PingMetadata;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  alertToken: string;
}
export const RegistrationEventV1Schema =
  SchemaFactory.createForClass(RegistrationEventV1);
export type RegistrationEventV1Type = HydratedDocument<RegistrationEventV1>;
