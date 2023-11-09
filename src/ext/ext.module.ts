import { Module } from '@nestjs/common';
import { ExtController } from './ext.controller';
import { ExtService } from './ext.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchemasModule } from 'src/schemas/schemas.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('EXT_JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    SchemasModule,
    FirebaseModule,
  ],
  providers: [ExtService],
  controllers: [ExtController],
})
export class ExtModule {}
