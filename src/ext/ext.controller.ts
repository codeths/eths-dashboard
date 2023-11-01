import {
  BadGatewayException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DeviceState, IDeviceStatus } from 'common/ext/oneToOneStatus.dto';
import {
  ApiBadGatewayResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ExtService } from './ext.service';

@Controller({
  path: 'ext',
  version: '1',
})
@ApiExtraModels(IDeviceStatus)
export class ExtController {
  constructor(private readonly extService: ExtService) {}
  private readonly logger = new Logger(ExtController.name);

  @ApiOperation({ summary: 'Proxies device status requests to OneToOne' })
  @ApiOkResponse({
    schema: {
      properties: {
        status: {
          $ref: getSchemaPath(IDeviceStatus),
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Device not found' })
  @ApiServiceUnavailableResponse({
    description: 'Failed to authenticate with OneToOne',
  })
  @ApiInternalServerErrorResponse({ description: 'Incorrect OneToOne key' })
  @ApiBadGatewayResponse({ description: 'No data in response from OneToOne' })
  @Get('status/:id')
  async getStatus(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<{ status: DeviceState }> {
    const startTime = Date.now();
    const { data } = await this.extService.getResponseFromOneToOne(id);
    const duration = Date.now() - startTime;
    this.logger.debug(`Proxied request took ${duration}ms`);
    res.set('Server-Timing', `proxy;dur=${duration}`);

    switch (data.message) {
      case 'Device not found':
        throw new NotFoundException('Device not found');

      case 'The api key is incorrect':
        throw new ServiceUnavailableException(
          'Failed to authenticate with OneToOne',
        );
    }

    if (!data.success)
      throw new InternalServerErrorException(
        'Unexpected OneToOne request failure',
      );

    if (!data.object)
      throw new BadGatewayException('No data in response from OneToOne');

    return {
      status: data.object,
    };
  }
}
