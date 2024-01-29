import { Request } from 'express';
import { WebUserDocument } from 'src/schemas/WebUser.schema';

export interface SessionData {
  id: string;
}

export interface AnyRequest extends Request {
  user?: SessionData;
}

export interface AuthenticatedRequest extends Request {
  user: WebUserDocument;
}
