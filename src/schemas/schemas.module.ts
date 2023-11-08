import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './Device.schema';
import { FirebaseToken, FirebaseTokenSchema } from './FirebaseToken.schema';

const schemas = MongooseModule.forFeature([
  { name: Device.name, schema: DeviceSchema },
  { name: FirebaseToken.name, schema: FirebaseTokenSchema },
]);

@Module({
  imports: [schemas],
  exports: [schemas],
})
export class SchemasModule {}
