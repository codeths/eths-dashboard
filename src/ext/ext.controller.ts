import {
  BadGatewayException,
  Body,
  Controller,
  InternalServerErrorException,
  Ip,
  Logger,
  Options,
  Post,
  Put,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';
import {
  ApiBadGatewayResponse,
  ApiCookieAuth,
  ApiExtraModels,
  ApiGatewayTimeoutResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ExtService } from './ext.service';
import { RegistrationDto } from 'common/ext/registration.dto';
import { PingDto } from 'common/ext/ping.dto';
import { AuthCookieLifespan, AuthCookieName } from './ext.constants';
import { AuthGuard } from './auth.guard';
import { DeviceAuthenticatedRequest } from './types/request';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller({
  path: 'ext',
  version: '1',
})
@ApiExtraModels(IDeviceStatus)
@ApiTags('Extension API')
export class ExtController {
  constructor(
    private readonly extService: ExtService,
    private readonly firebaseService: FirebaseService,
  ) {}
  private readonly logger = new Logger(ExtController.name);

  @Options(['register', 'ping'])
  preflights() {}

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
  @ApiUnauthorizedResponse({ description: 'Device not found' })
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
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { serial, alertToken, email, googleID } = device;

    //  -----  Fetch Status  -----

    const startTime = Date.now();
    const { data } = await this.extService.getResponseFromOneToOne(serial);
    const duration = Date.now() - startTime;
    this.logger.debug(`Proxied request took ${duration}ms`);
    res.set('Server-Timing', `proxy;dur=${duration}`);

    switch (data.message) {
      case 'Device not found':
        throw new UnauthorizedException('Device not in OneToOne');

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

    //  -----  DB Operations  -----

    const userDoc = await this.extService.saveUser(email, googleID);
    const deviceDoc = await this.extService.saveDevice(serial);
    const alertTokenDoc = await this.extService.saveAlertToken(
      deviceDoc.id,
      alertToken,
    );

    await this.extService.generateRegistrationEvent(
      deviceDoc.id,
      userDoc.id,
      alertTokenDoc.id,
      ipAddress,
    );

    //  -----  Init Firebase  -----

    try {
      await this.firebaseService.mapTokenToDevice(serial, alertToken);
      await this.firebaseService.attemptSend(serial);
    } catch (error) {
      this.logger.warn('Firebase operation failed:');
      console.log(error);
    }

    //  -----  Generate AuthToken  -----

    const authToken = await this.extService.generateToken(
      deviceDoc.id,
      alertTokenDoc.id,
    );

    res.cookie(AuthCookieName, authToken, {
      httpOnly: true,
      maxAge: AuthCookieLifespan,
      sameSite: 'none',
      secure: true,
    });

    return {
      status: data.object,
    };
  }

  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Invalid or expired session' })
  @UseGuards(AuthGuard)
  @Put('ping')
  async ping(
    @Req() req: DeviceAuthenticatedRequest,
    @Body(new ValidationPipe({ enableDebugMessages: true })) pingDto: PingDto,
    @Ip() ipAddress: string,
  ) {
    const { sub: deviceID, alerts: alertTokenID } = req.authToken;
    const { email, googleID } = pingDto;

    const alertTokenDoc = await this.extService.updateAlertToken(alertTokenID);
    if (!alertTokenDoc) throw new UnauthorizedException();
    const userDoc = await this.extService.saveUser(email, googleID);
    await this.extService.generatePingEvent(deviceID, userDoc.id, ipAddress);
  }
}
