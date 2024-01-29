import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { SchemasModule } from 'src/schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [WebController],
})
export class WebModule {}
