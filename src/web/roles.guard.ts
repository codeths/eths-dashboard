import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { AuthenticatedRequest } from './types/request';
import { UserRoleName, WebUserDocument } from 'src/schemas/WebUser.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user.toObject({ getters: true }) as WebUserDocument & {
      roles: UserRoleName[];
    };

    return roles.every((role) => user.roles.includes(role));
  }
}
