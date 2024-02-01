import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PingEventV1 } from 'src/schemas/Event.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(PingEventV1.name)
    private readonly pingEventModel: Model<PingEventV1>,
  ) {}

  async getDevicesOnline() {
    const results = await this.pingEventModel
      .aggregate()
      .match({
        $expr: {
          $gt: [
            '$timestamp',
            {
              $dateSubtract: {
                startDate: '$$NOW',
                unit: 'minute',
                amount: 2,
              },
            },
          ],
        },
      })
      .group({ _id: '$metadata.device' })
      .count('onlineCount');

    const count = results[0]?.onlineCount || 0;
    return { count };
  }
}
