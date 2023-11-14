import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './Device.schema';
import { FirebaseToken, FirebaseTokenSchema } from './FirebaseToken.schema';
import {
  Event,
  EventSchema,
  PingEventV1,
  PingEventV1Schema,
} from './Event.schema';

const schemas = MongooseModule.forFeature([
  { name: Device.name, schema: DeviceSchema },
  { name: FirebaseToken.name, schema: FirebaseTokenSchema },
  {
    name: Event.name,
    schema: EventSchema,
    discriminators: [
      {
        name: PingEventV1.name,
        schema: PingEventV1Schema,
      },
    ],
  },
]);

@Module({
  imports: [schemas],
  exports: [schemas],
})
export class SchemasModule {}
