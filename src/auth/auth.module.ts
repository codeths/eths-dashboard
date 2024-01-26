import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { OAuthLogger } from './logger.provider';
import { SessionSerializer } from './session.serializer';

@Module({
  providers: [GoogleStrategy, OAuthLogger, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
