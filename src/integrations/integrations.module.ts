import { Module } from '@nestjs/common';
import { OneToOneService } from './OneToOne.service';

@Module({
  providers: [OneToOneService],
  exports: [OneToOneService],
})
export class IntegrationsModule {}
