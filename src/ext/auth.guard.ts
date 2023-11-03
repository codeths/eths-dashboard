import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCookieAlgorithm, AuthCookieName } from './ext.constants';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenV1 } from 'common/ext/authToken.dto';
import { DeviceAuthenticatedRequest } from './types/request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<DeviceAuthenticatedRequest>();
    const authCookie = req.cookies[AuthCookieName];

    if (!authCookie) return false;

    try {
      const result = await this.jwtService.verifyAsync<AuthTokenV1>(
        authCookie,
        { algorithms: [AuthCookieAlgorithm] },
      );
      req.authToken = result;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
