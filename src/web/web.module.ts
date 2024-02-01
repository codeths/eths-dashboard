import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { SchemasModule } from 'src/schemas/schemas.module';
import { DeviceService } from './device.service';

@Module({
  imports: [SchemasModule],
  providers: [DeviceService],
  controllers: [WebController],
})
export class WebModule {}
