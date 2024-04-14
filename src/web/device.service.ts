import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Device, DeviceDocument } from 'src/schemas/Device.schema';
import {
  OneToOneStatusUpdateV1Type,
  PingEventV1,
  PingEventV1Type,
  RegistrationEventV1Type,
} from 'src/schemas/Event.schema';
import { ExtUserDocument } from 'src/schemas/ExtUser.schema';
import { OrderValue, SortValue } from 'common/web/deviceSort';

type DeviceQueryResponse = DeviceDocument & {
  lastSeen: PingEventV1Type | RegistrationEventV1Type;
  lastUpdate: OneToOneStatusUpdateV1Type;
  lastUser: ExtUserDocument;
  isOnline: boolean;
};

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

  async getAllDevices(
    limit: number,
    skip: number,
    filters: {
      status?: IDeviceStatus['deviceStatus'];
      type?: IDeviceStatus['loanerStatus'];
      sortKey?: SortValue;
      sortOrder?: OrderValue;
      serial?: string;
    },
  ) {
    let parsedFilters: FilterQuery<any> = {};
    if (filters.status)
      parsedFilters['lastUpdate.deviceStatus'] = filters.status;
    if (filters.type)
      parsedFilters['lastUpdate.metadata.loanerStatus'] = filters.type;

    const sortKeyMap: Record<SortValue, string> = {
      serial: 'serialNumber',
      lastSeen: 'lastSeen.timestamp',
      status: 'lastUpdate.deviceStatus',
      user: 'lastUser.email',
      loaner: 'lastUpdate.metadata.loanerStatus',
    };
    let sortOptions:
      | Record<(typeof sortKeyMap)[SortValue], SortOrder>
      | undefined;
    if (filters.sortKey)
      sortOptions = {
        [sortKeyMap[filters.sortKey]]: filters.sortOrder || 'descending',
      };

    let query = this.deviceModel.aggregate<{
      count: [{ count: number }];
      results: DeviceQueryResponse[];
    }>();

    if (filters.serial)
      query = query.match({
        $expr: {
          $eq: [filters.serial.toUpperCase(), { $toUpper: '$serialNumber' }],
        },
      });

    query = query
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
      .match(filters.serial ? {} : parsedFilters);

    if (sortOptions) query = query.sort(sortOptions);

    query = query.facet({
      count: [{ $count: 'count' }],
      results: [{ $skip: skip }, { $limit: limit }],
    });

    const queryResponse = await query.exec();

    if (queryResponse.length > 0 && queryResponse[0].results.length > 0) {
      const [
        {
          count: [{ count }],
          results,
        },
      ] = await query.exec();

      return {
        results,
        count,
      };
    } else {
      return {
        results: [],
        count: 0,
      };
    }
  }
}
