import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller({
  path: 'web',
  version: '1',
})
export class WebController {
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
