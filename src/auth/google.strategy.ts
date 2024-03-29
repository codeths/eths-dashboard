import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthLogger } from './logger.provider';
import { InjectModel } from '@nestjs/mongoose';
import { WebUser } from 'src/schemas/WebUser.schema';
import { Model } from 'mongoose';
import { SessionData } from 'src/web/types/request';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: OAuthLogger,
    @InjectModel(WebUser.name) private readonly userModel: Model<WebUser>,
  ) {
    const callbackURL = `${configService.getOrThrow(
      'PUBLIC_HOST',
    )}/api/auth/google/cbk`;
    const clientID = configService.getOrThrow('OAUTH_CLIENT_ID');
    const clientSecret = configService.getOrThrow('OAUTH_CLIENT_SECRET');
    const scope = ['openid', 'email', 'profile'];

    logger.log(`OAuth callback url: ${callbackURL}`);

    super({
      callbackURL,
      clientID,
      clientSecret,
      scope,
      session: true,
    });
  }

  authenticate(req: Request, options: any): any {
    const authDomain = this.configService.getOrThrow('AUTH_DOMAIN');
    const newOptions = { hd: authDomain, ...options };

    super.authenticate(req, newOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: any,
    profile: {
      id: string;
      displayName: string;
      name: { familyName: string; givenName: string };
      emails: { value: string; verified: boolean }[];
      photos: { value: string }[];
    },
    done: (err: any, user: SessionData) => void,
  ) {
    if (profile.emails?.length === 0)
      throw new BadRequestException('No email provided');
    if (!profile.displayName) throw new BadRequestException('No name provided');

    const { id, displayName, emails, photos } = profile;
    const [{ value: email }] = emails;
    const authDomain = this.configService.getOrThrow('AUTH_DOMAIN');

    if (!email.endsWith(`@${authDomain}`))
      throw new ForbiddenException(`${email} is not a member of ${authDomain}`);

    this.logger.verbose(`LOGIN: ${email}`);

    const user = await this.userModel.findOneAndUpdate(
      { googleID: id },
      { email, name: displayName, photo: photos[0]?.value },
      { upsert: true, new: true },
    );

    done(null, { id: user.id });
  }
}
