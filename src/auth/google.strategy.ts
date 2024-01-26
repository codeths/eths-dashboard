import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthLogger } from './logger.provider';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: OAuthLogger,
  ) {
    const callbackURL = `${configService.getOrThrow(
      'PUBLIC_HOST',
    )}/api/auth/google/cbk`;
    const clientID = configService.getOrThrow('OAUTH_CLIENT_ID');
    const clientSecret = configService.getOrThrow('OAUTH_CLIENT_SECRET');
    const scope = ['openid'];

    logger.log(`OAuth callback url: ${callbackURL}`);

    super({ callbackURL, clientID, clientSecret, scope, session: true });
  }

  async validate(
    accessToken: string,
    refreshToken: any,
    profile: { id: string; photos: { value: string }[] },
    cb: (err: any, user: any) => void,
  ) {
    cb(null, { id: profile.id });
  }
}
