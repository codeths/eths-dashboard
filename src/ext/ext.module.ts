import { Module } from '@nestjs/common';
import { ExtController } from './ext.controller';
import { ExtService } from './ext.service';

@Module({
  providers: [ExtService],
  controllers: [ExtController]
})
export class ExtModule {}
