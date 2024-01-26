import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  google() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/cbk')
  callback(@Req() req: Request, @Res() res: Response) {
    console.log(new Date(), 'user:', req.user);
    console.log('session:', req.session);
    res.redirect('/');
  }
}
