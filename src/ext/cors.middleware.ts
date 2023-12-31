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

    next();
  }
}
