import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class OAuthLogger extends Logger {
  constructor() {
    super('OAuth');
  }
}
