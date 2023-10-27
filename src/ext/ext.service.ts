import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OneToOneStatus } from 'common/ext/oneToOneStatus.dto';

@Injectable()
export class ExtService {
  constructor(private configService: ConfigService) {}

  async getResponseFromOneToOne(deviceSerial: string) {
    const key = this.configService.getOrThrow('ONETOONE_KEY');
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
}
