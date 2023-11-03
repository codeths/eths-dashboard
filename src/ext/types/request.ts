import { AuthTokenV1 } from 'common/ext/authToken.dto';
import { Request } from 'express';

export interface DeviceAuthenticatedRequest extends Request {
  authToken: AuthTokenV1;
}
