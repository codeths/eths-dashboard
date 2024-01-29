import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Google Authentication')
export class AuthController {
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  google() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/cbk')
  callback(@Req() req: Request, @Res() res: Response) {
    res.redirect('/');
  }
}
