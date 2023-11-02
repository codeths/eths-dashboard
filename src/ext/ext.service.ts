import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import axios from 'axios';
import { OneToOneStatus } from 'common/ext/oneToOneStatus.dto';
import { AuthCookieAlgorithm } from './ext.constants';

@Injectable()
export class ExtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
          'Failed to get a response from OneToOne',
        );
      });

    return { data };
  }
  async generateToken(deviceSerial: string) {
    const payload = {
      sub: deviceSerial,
      extraData: 1234,
    };
    const options: JwtSignOptions = {
      algorithm: AuthCookieAlgorithm,
    };
    return await this.jwtService.signAsync(payload, options);
  }
}
