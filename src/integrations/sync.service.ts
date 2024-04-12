import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  OneToOneStatusUpdateV1,
  OneToOneStatusUpdateV1Type,
} from 'src/schemas/Event.schema';
import { Device, DeviceDocument } from 'src/schemas/Device.schema';
import { OneToOneService } from './OneToOne.service';

import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';

export const DeviceRefreshRates = {
  personal: 60 * 60_000,
  shortTerm: 2 * 60_000,
  longTerm: 5 * 60_000,
  cart: 24 * 60 * 60_000,
};

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(OneToOneStatusUpdateV1.name)
    private readonly oneToOneStatusModel: Model<OneToOneStatusUpdateV1>,
    private readonly oneToOneService: OneToOneService,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>,
  ) {}
  private readonly logger = new Logger(SyncService.name);

  getCachedStatusForDevice(deviceID: string) {
    return this.oneToOneStatusModel
      .findOne({ 'metadata.device': deviceID })
      .sort({ timestamp: -1 })
      .exec();
  }

  async updateStatus(deviceID: string, deviceSerial: string) {
    const [{ data: apiResponse }, cached] = await Promise.all([
      this.oneToOneService.getResponseFromOneToOne(deviceSerial),
      this.getCachedStatusForDevice(deviceID),
    ]);
    if (!apiResponse.success || !apiResponse.object)
      throw new Error(`Failed to fetch status for ${deviceSerial}`);
    if (!cached)
      throw new Error(`No status cached for ${deviceSerial} (${deviceID})`);

    const statusChanged =
      apiResponse.object.deviceStatus !== cached.deviceStatus;
    const typeChanged =
      apiResponse.object.loanerStatus !== cached.metadata.loanerStatus;

    if (statusChanged || typeChanged) {
      this.logger.log(`Status changed in 1:1 for ${deviceSerial}`);
      try {
        await this.oneToOneService.generateStatusEvent(
          apiResponse.object,
          deviceID,
        );
      } catch (error) {
        throw new Error(
          `Failed to save updated status for ${deviceSerial}: ${error}`,
        );
      }
    }
  }

  getAllDevicesForType(loanerStatus: IDeviceStatus['loanerStatus']) {
    return this.deviceModel
      .aggregate<DeviceDocument & { lastUpdate: OneToOneStatusUpdateV1Type }>()
      .lookup({
        from: 'events',
        localField: '_id',
        foreignField: 'metadata.device',
        pipeline: [
          {
            $match: {
              __t: 'OneToOneStatusUpdateV1',
            },
          },
        ],
        as: 'lastUpdate',
      })
      .addFields({
        lastUpdate: {
          $last: '$lastUpdate',
        },
      })
      .match({
        'lastUpdate.metadata.loanerStatus': loanerStatus,
      })
      .exec();
  }

  @Interval('sync.personal', DeviceRefreshRates.personal)
  syncPersonalDevices() {
    this.logger.debug('syncPersonalDevices()');
  }

  @Interval('sync.shortTerm', DeviceRefreshRates.shortTerm)
  syncShortTerm() {
    this.logger.debug('syncShortTerm()');
  }

  @Interval('sync.longTerm', DeviceRefreshRates.longTerm)
  syncLongTerm() {
    this.logger.debug('syncLongTerm()');
  }

  @Interval('sync.cart', DeviceRefreshRates.cart)
  syncCartDevices() {
    this.logger.debug('syncCartDevices()');
  }

  onApplicationBootstrap() {
    this.syncPersonalDevices();
    this.syncShortTerm();
    this.syncLongTerm();
    this.syncCartDevices();
  }
}
