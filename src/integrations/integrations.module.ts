import { Module } from '@nestjs/common';
import { OneToOneService } from './OneToOne.service';
import { SchemasModule } from 'src/schemas/schemas.module';
import { SyncService } from './sync.service';

@Module({
  imports: [SchemasModule],
  providers: [OneToOneService, SyncService],
  exports: [OneToOneService],
})
export class IntegrationsModule {}
