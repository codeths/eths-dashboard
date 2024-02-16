import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Device } from './Device.schema';
import { ExtUser } from './ExtUser.schema';
import { FirebaseToken } from './FirebaseToken.schema';
import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';

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
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Device.name,
  })
  device: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: ExtUser.name,
  })
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

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: FirebaseToken.name,
  })
  alertToken: string;
}
export const RegistrationEventV1Schema =
  SchemaFactory.createForClass(RegistrationEventV1);
export type RegistrationEventV1Type = HydratedDocument<RegistrationEventV1>;

@Schema({ _id: false })
class DeviceMetadata {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Device.name,
  })
  device: string;

  @Prop({ required: true, type: String, index: { sparse: true } })
  loanerStatus: IDeviceStatus['loanerStatus'];
}
const DeviceMetadataSchema = SchemaFactory.createForClass(DeviceMetadata);

@Schema()
export class OneToOneStatusUpdateV1 extends Event {
  @Prop({ required: true, type: DeviceMetadataSchema })
  metadata: DeviceMetadata;

  @Prop({ required: true, type: String })
  deviceStatus: IDeviceStatus['deviceStatus'];

  @Prop()
  startDate?: Date;
}
export const OneToOneStatusUpdateV1Schema = SchemaFactory.createForClass(
  OneToOneStatusUpdateV1,
);
export type OneToOneStatusUpdateV1Type =
  HydratedDocument<OneToOneStatusUpdateV1>;
