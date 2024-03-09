import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from 'src/schemas/Device.schema';
import {
  OneToOneStatusUpdateV1Type,
  PingEventV1,
  PingEventV1Type,
  RegistrationEventV1Type,
} from 'src/schemas/Event.schema';
import { ExtUserDocument } from 'src/schemas/ExtUser.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(PingEventV1.name)
    private readonly pingEventModel: Model<PingEventV1>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>,
  ) {}

  PingInterval = 2;

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
                amount: this.PingInterval,
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

  async getAllDevices(limit: number, skip: number) {
    const query = this.deviceModel
      .aggregate<
        DeviceDocument & {
          lastSeen: PingEventV1Type | RegistrationEventV1Type;
          lastUpdate: OneToOneStatusUpdateV1Type;
          lastUser: ExtUserDocument;
          isOnline: boolean;
        }
      >()
      .lookup({
        from: 'events',
        localField: '_id',
        foreignField: 'metadata.device',
        as: 'results',
      })
      .addFields({
        lastSeen: {
          $last: {
            $filter: {
              input: '$results',
              as: 'event',
              cond: {
                $in: ['$$event.__t', ['PingEventV1', 'RegistrationEventV1']],
              },
            },
          },
        },
        lastUpdate: {
          $last: {
            $filter: {
              input: '$results',
              as: 'event',
              cond: {
                $eq: ['$$event.__t', 'OneToOneStatusUpdateV1'],
              },
            },
          },
        },
      })
      .project({ results: 0 })
      .lookup({
        from: 'extusers',
        localField: 'lastSeen.metadata.user',
        foreignField: '_id',
        as: 'lastUser',
      })
      .addFields({
        lastUser: {
          $first: '$lastUser',
        },
        isOnline: {
          $gt: [
            '$lastSeen.timestamp',
            {
              $dateSubtract: {
                startDate: '$$NOW',
                unit: 'minute',
                amount: this.PingInterval,
              },
            },
          ],
        },
      })
      .skip(skip)
      .limit(limit);

    const results = await query.exec();
    const count = await this.deviceModel.countDocuments().exec();

    return {
      results,
      count,
    };
  }
}
