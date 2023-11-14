import {
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import axios from 'axios';
import { OneToOneStatus } from 'common/ext/oneToOneStatus.dto';
import { AuthCookieAlgorithm } from './ext.constants';
import { AuthTokenV1 } from 'common/ext/authToken.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from 'src/schemas/Device.schema';
import { FirebaseToken } from 'src/schemas/FirebaseToken.schema';
import { PingEventV1 } from 'src/schemas/Event.schema';
import { PingDto } from 'common/ext/ping.dto';

@Injectable()
export class ExtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(FirebaseToken.name)
    private readonly firebaseTokenModel: Model<FirebaseToken>,
    @InjectModel(PingEventV1.name)
    private readonly pingEventModel: Model<PingEventV1>,
  ) {}

  async getResponseFromOneToOne(deviceSerial: string) {
    const key = this.configService.getOrThrow<string>('ONETOONE_KEY');
    const { data } = await axios
      .get<OneToOneStatus>(
        `https://customapp.eths.k12.il.us/api/studentapplication/getonetoonebyserial/${deviceSerial}`,
        { headers: { key }, timeout: 5000 },
      )
      .catch(() => {
        throw new GatewayTimeoutException(
          'Failed to communicate with OneToOne',
        );
      });

    return { data };
  }
  async generateToken(deviceSerial: string, alertTokenId: string) {
    const payload: AuthTokenV1 = {
      v: 1,
      sub: deviceSerial,
      alerts: alertTokenId,
    };
    const options: JwtSignOptions = {
      algorithm: AuthCookieAlgorithm,
    };
    return await this.jwtService.signAsync(payload, options);
  }

  async saveDevice(deviceSerial: string) {
    const deviceDoc = await this.deviceModel.findOneAndUpdate(
      { serialNumber: deviceSerial },
      {},
      { upsert: true, new: true },
    );
    return deviceDoc;
  }
  async saveAlertToken(deviceSerial: string, alertToken: string) {
    const device = await this.deviceModel.findOne(
      { serialNumber: deviceSerial },
      'id',
    );

    if (!device?.id)
      throw new InternalServerErrorException(
        'Failed to save alert token: device not saved in db',
      );

    const alertTokenDoc = await this.firebaseTokenModel.findOneAndUpdate(
      { token: alertToken },
      { lastUsed: new Date(), device: device.id },
      { upsert: true, new: true },
    );
    return alertTokenDoc;
  }
  async handlePing(
    deviceSerial: string,
    alertTokenId: string,
    pingDto: PingDto,
    ipAddress: string,
  ) {
    const alertTokenDoc = await this.firebaseTokenModel.findByIdAndUpdate(
      alertTokenId,
      { lastUsed: new Date() },
      { new: true },
    );
    console.log(pingDto);

    const device = await this.deviceModel.findOne(
      { serialNumber: deviceSerial },
      'id',
    );

    if (!device?.id)
      throw new InternalServerErrorException(
        'Failed to save event: device not saved in db',
      );

    const pingEvent = new this.pingEventModel({
      timestamp: new Date(),
      metadata: {
        device: device.id,
        googleID: pingDto.googleID.toString(),
      },
      email: pingDto.email,
      ipAddress,
    });
    const pingEventDoc = await pingEvent.save();

    return { alertTokenDoc, pingEventDoc };
  }
}
