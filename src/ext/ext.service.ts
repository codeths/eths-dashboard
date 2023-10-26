import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { oneToOneStatus } from 'common/ext/oneToOneStatus.dto';

@Injectable()
export class ExtService {
  constructor(private configService: ConfigService) {}

  async getResponseFromOneToOne(deviceSerial: string) {
    const key = this.configService.getOrThrow('ONETOONE_KEY');
    const { data } = await axios
      .get<oneToOneStatus>(
        `https://customapp.eths.k12.il.us/api/studentapplication/getonetoonebyserial/${deviceSerial}`,
        { headers: { key } },
      )
      .catch(() => {
        throw new GatewayTimeoutException(
          'Failed to get a response from OneToOne',
        );
      });

    return { data };
  }
}
