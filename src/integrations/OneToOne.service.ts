import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { OneToOneStatusUpdateV1 } from 'src/schemas/Event.schema';
import { Model } from 'mongoose';

import { DeviceState, OneToOneStatus } from 'common/ext/oneToOneStatus.dto';

@Injectable()
export class OneToOneService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(OneToOneStatusUpdateV1.name)
    private readonly oneToOneStatusModel: Model<OneToOneStatusUpdateV1>,
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

  async generateStatusEvent(data: DeviceState, deviceID: string) {
    const { loanerStatus, deviceStatus, startDate } = data;

    const init: OneToOneStatusUpdateV1 = {
      timestamp: new Date(),
      metadata: {
        device: deviceID,
        loanerStatus,
      },
      deviceStatus,
    };
    if (startDate) init.startDate = new Date(startDate);

    const statusEventDoc = await new this.oneToOneStatusModel(init).save();

    return statusEventDoc;
  }
}
