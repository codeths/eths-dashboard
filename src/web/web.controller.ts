import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
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

  @Roles(['View'])
  @Get('devices/search')
  async searchDevices(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    if (page < 0) throw new BadRequestException('Page cannot be negative');

    const itemsPerPage = 20;
    const { results: devices, count } = await this.deviceService.getAllDevices(
      itemsPerPage,
      page * itemsPerPage,
    );
    const response = devices.map(
      ({ _id, serialNumber, lastSeen, lastUser, lastUpdate, isOnline }) => {
        return {
          id: _id,
          serialNumber,
          lastSeen: {
            timestamp: lastSeen.timestamp,
            ipAddress: lastSeen.ipAddress,
          },
          lastUpdate: {
            timestamp: lastUpdate.timestamp,
            loanerStatus: lastUpdate.metadata.loanerStatus,
            deviceStatus: lastUpdate.deviceStatus,
            startDate: lastUpdate.startDate || null,
          },
          lastUser: {
            id: lastUser._id,
            googleID: lastUser.googleID,
            email: lastUser.email,
          },
          isOnline,
        };
      },
    );

    return {
      results: response,
      pages: Math.ceil(count / itemsPerPage),
    };
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
