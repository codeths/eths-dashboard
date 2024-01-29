import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AnyRequest, AuthenticatedRequest } from './types/request';
import { InjectModel } from '@nestjs/mongoose';
import { WebUser } from 'src/schemas/WebUser.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(WebUser.name) private readonly userModel: Model<WebUser>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context
      .switchToHttp()
      .getRequest<AnyRequest | AuthenticatedRequest>();
    const userID = req.user?.id;

    if (!userID) return false;

    delete req.user; // loaded by passport; only contains ObjectID

    const user = await this.userModel.findById(userID);

    if (!user) throw new BadGatewayException('Failed to fetch user'); // shouldn't ever happen

    req.user = user;

    return true;
  }
}
