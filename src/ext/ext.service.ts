import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthCookieAlgorithm } from './ext.constants';
import { AuthTokenV1 } from 'common/ext/authToken.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from 'src/schemas/Device.schema';
import { FirebaseToken } from 'src/schemas/FirebaseToken.schema';
import { PingEventV1, RegistrationEventV1 } from 'src/schemas/Event.schema';
import { ExtUser } from 'src/schemas/ExtUser.schema';

@Injectable()
export class ExtService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(FirebaseToken.name)
    private readonly firebaseTokenModel: Model<FirebaseToken>,
    @InjectModel(PingEventV1.name)
    private readonly pingEventModel: Model<PingEventV1>,
    @InjectModel(ExtUser.name) private readonly userModel: Model<ExtUser>,
    @InjectModel(RegistrationEventV1.name)
    private readonly registrationEventModel: Model<RegistrationEventV1>,
  ) {}

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

  async saveUser(email: string, googleID: string) {
    const userDoc = await this.userModel.findOneAndUpdate(
      { googleID },
      { email },
      { upsert: true, new: true },
    );
    return userDoc;
  }
  async saveDevice(deviceSerial: string) {
    const deviceDoc = await this.deviceModel.findOneAndUpdate(
      { serialNumber: deviceSerial },
      {},
      { upsert: true, new: true },
    );
    return deviceDoc;
  }
  async saveAlertToken(deviceID: string, alertToken: string) {
    const alertTokenDoc = await this.firebaseTokenModel.findOneAndUpdate(
      { token: alertToken },
      { lastUsed: new Date(), device: deviceID },
      { upsert: true, new: true },
    );
    return alertTokenDoc;
  }
  async updateAlertToken(alertTokenID: string) {
    const alertTokenDoc = await this.firebaseTokenModel.findByIdAndUpdate(
      alertTokenID,
      { lastUsed: new Date() },
      { new: true },
    );
    return alertTokenDoc;
  }

  async generatePingEvent(deviceID: string, userID: string, ipAddress: string) {
    const pingEventDoc = await new this.pingEventModel({
      timestamp: new Date(),
      metadata: {
        device: deviceID,
        user: userID,
      },
      ipAddress,
    }).save();

    return pingEventDoc;
  }
  async generateRegistrationEvent(
    deviceID: string,
    userID: string,
    alertTokenID: string,
    ipAddress: string,
  ) {
    const registrationEventDoc = await new this.registrationEventModel({
      timestamp: new Date(),
      metadata: {
        device: deviceID,
        user: userID,
      },
      ipAddress: ipAddress,
      alertToken: alertTokenID,
    }).save();

    return registrationEventDoc;
  }
}
