import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from './types/request';
import { WebUser } from 'src/schemas/WebUser.schema';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AccessService } from './access.service';
import { RoleUpdateDto } from 'common/web/roleUpdate.dto';

@Controller({
  path: 'web',
  version: '1',
})
@ApiTags('Web Client API')
@UseGuards(AuthGuard, RolesGuard)
export class WebController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly accessService: AccessService,
  ) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return {
      user: WebUser.toAPIResponse(req.user),
    };
  }

  @Roles(['View'])
  @Get('devices/online')
  async devicesOnline() {
    return await this.deviceService.getDevicesOnline();
  }

  @Roles(['Admin'])
  @Get('access')
  async accessAllUsers() {
    return await this.accessService.getAllUsers();
  }

  @Roles(['Admin'])
  @Patch('access/:userID')
  async updateUserRoles(
    @Param('userID') userID: string,
    @Body(new ValidationPipe({ enableDebugMessages: true }))
    { roles }: RoleUpdateDto,
  ) {
    try {
      return await this.accessService.setUserRoles(userID, roles);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Roles(['Admin'])
  @Delete('access/:userID')
  async deleteUser(@Param('userID') userID: string) {
    try {
      await this.accessService.deleteUser(userID);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
