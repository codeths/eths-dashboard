import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const extensionID = this.configService.getOrThrow('EXTENSION_ID');
    res.setHeader(
      'Access-Control-Allow-Origin',
      `chrome-extension://${extensionID}`,
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Extension-Version',
    );
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT');

    if (req.method.toUpperCase() === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  }
}
