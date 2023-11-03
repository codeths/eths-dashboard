import {
  BadGatewayException,
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  ValidationPipe,
} from '@nestjs/common';
import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';
import {
  ApiBadGatewayResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiGatewayTimeoutResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ExtService } from './ext.service';
import { RegistrationDto } from 'common/ext/registration.dto';
import { AuthCookieLifespan, AuthCookieName } from './ext.constants';

@Controller({
  path: 'ext',
  version: '1',
})
@ApiExtraModels(IDeviceStatus)
export class ExtController {
  constructor(private readonly extService: ExtService) {}
  private readonly logger = new Logger(ExtController.name);

  @ApiOperation({
    description:
      'Links the Firebase token to the serial number & sets auth cookie',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        status: {
          $ref: getSchemaPath(IDeviceStatus),
        },
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Device not found' })
  @ApiServiceUnavailableResponse({
    description: 'Incorrect OneToOne key',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected OneToOne request failure',
  })
  @ApiBadGatewayResponse({ description: 'No data in response from OneToOne' })
  @ApiGatewayTimeoutResponse({
    description: 'Failed to communicate with OneToOne',
  })
  @Post('register')
  async register(
    @Body(new ValidationPipe({ enableDebugMessages: true }))
    device: RegistrationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { serial, alertToken } = device;

    //  -----  Fetch Status  -----

    const startTime = Date.now();
    const { data } = await this.extService.getResponseFromOneToOne(serial);
    const duration = Date.now() - startTime;
    this.logger.debug(`Proxied request took ${duration}ms`);
    res.set('Server-Timing', `proxy;dur=${duration}`);

    switch (data.message) {
      case 'Device not found':
        throw new ForbiddenException('Device not in OneToOne');

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

    //  -----  Generate AuthToken  -----

    const authToken = await this.extService.generateToken(serial);

    res.cookie(AuthCookieName, authToken, {
      httpOnly: true,
      maxAge: AuthCookieLifespan,
    });

    return {
      status: data.object,
    };
  }
}
