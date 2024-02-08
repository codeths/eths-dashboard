import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { SchemasModule } from 'src/schemas/schemas.module';
import { DeviceService } from './device.service';
import { AccessService } from './access.service';

@Module({
  imports: [SchemasModule],
  providers: [DeviceService, AccessService],
  controllers: [WebController],
})
export class WebModule {}
