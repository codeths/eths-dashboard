import { Module } from '@nestjs/common';
import { ExtController } from './ext.controller';
import { ExtService } from './ext.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('EXT_JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ExtService],
  controllers: [ExtController],
})
export class ExtModule {}
