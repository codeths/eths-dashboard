import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Ip,
  NotFoundException,
  Param,
  ParseEnumPipe,
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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AccessService } from './access.service';
import { RoleUpdateDto } from 'common/web/roleUpdate.dto';
import {
  DeviceStatusValues,
  DeviceTypeValues,
  IDeviceStatus,
} from 'common/ext/oneToOneStatus.dto';
import {
  OrderValue,
  SortValue,
  sortOrders,
  sortValues,
} from 'common/web/deviceSort';
import { Request } from 'express';

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

  @Get('test')
  getIP(@Ip() ipAddress: string, @Req() request: Request) {
    return { ipAddress, ips: request.ips };
  }

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

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DeviceStatusValues })
  @ApiQuery({ name: 'type', required: false, enum: DeviceTypeValues })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: sortValues,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: sortOrders,
    description: 'Only applies when `sort` is set',
  })
  @ApiQuery({
    name: 'serial',
    required: false,
    type: String,
    description: 'Overrides all filter queries when set',
  })
  @Roles(['View'])
  @Get('devices/search')
  async searchDevices(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query(
      'order',
      new DefaultValuePipe('desc'),
      new ParseEnumPipe(sortOrders, { optional: true }),
    )
    sortOrder: OrderValue,
    @Query('status', new ParseEnumPipe(DeviceStatusValues, { optional: true }))
    status?: IDeviceStatus['deviceStatus'],
    @Query('type', new ParseEnumPipe(DeviceTypeValues, { optional: true }))
    type?: IDeviceStatus['loanerStatus'],
    @Query('sort', new ParseEnumPipe(sortValues, { optional: true }))
    sortKey?: SortValue,
    @Query('serial') serial?: string,
  ) {
    if (page < 0) throw new BadRequestException('Page cannot be negative');

    const itemsPerPage = 20;
    const { results: devices, count } = await this.deviceService.getAllDevices(
      itemsPerPage,
      page * itemsPerPage,
      { status, type, sortKey, sortOrder, serial: serial?.trim() },
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
