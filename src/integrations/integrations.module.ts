import { Module } from '@nestjs/common';
import { OneToOneService } from './OneToOne.service';
import { SchemasModule } from 'src/schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  providers: [OneToOneService],
  exports: [OneToOneService],
})
export class IntegrationsModule {}
