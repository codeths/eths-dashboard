import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from './types/request';
import { WebUser } from 'src/schemas/WebUser.schema';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';

@Controller({
  path: 'web',
  version: '1',
})
@ApiTags('Web Client API')
@UseGuards(AuthGuard)
export class WebController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return {
      user: WebUser.toAPIResponse(req.user),
    };
  }

  @Get('devices/online')
  async devicesOnline() {
    return await this.deviceService.getDevicesOnline();
  }
}
