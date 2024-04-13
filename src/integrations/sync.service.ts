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
    try {
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
      const apiStartDateMS = apiResponse.object.startDate
        ? new Date(apiResponse.object.startDate).getTime()
        : undefined;
      const cachedStartDateMS = cached.startDate?.getTime();
      const startDateChanged = cachedStartDateMS !== apiStartDateMS;

      if (statusChanged || typeChanged || startDateChanged) {
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
    } catch (error) {
      this.logger.warn(error);
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

  async scheduleTasks(
    loanerStatus: IDeviceStatus['loanerStatus'],
    intervalLength: number,
  ) {
    try {
      const devices = await this.getAllDevicesForType(loanerStatus);

      for (const [index, device] of devices.entries()) {
        const deadline = Math.floor((intervalLength / devices.length) * index);
        setTimeout(
          () =>
            this.updateStatus(device._id.toHexString(), device.serialNumber),
          deadline,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to schedule sync for "${loanerStatus}": ${error}`,
      );
    }
  }

  @Interval('sync.personal', DeviceRefreshRates.personal)
  syncPersonalDevices() {
    this.logger.debug('syncPersonalDevices()');
    this.scheduleTasks('Not A Loaner', DeviceRefreshRates.personal);
  }

  @Interval('sync.shortTerm', DeviceRefreshRates.shortTerm)
  syncShortTerm() {
    this.logger.debug('syncShortTerm()');
    this.scheduleTasks('Short Term Loaners', DeviceRefreshRates.shortTerm);
  }

  @Interval('sync.longTerm', DeviceRefreshRates.longTerm)
  syncLongTerm() {
    this.logger.debug('syncLongTerm()');
    this.scheduleTasks('Long Term Loaners', DeviceRefreshRates.longTerm);
  }

  @Interval('sync.cart', DeviceRefreshRates.cart)
  syncCartDevices() {
    this.logger.debug('syncCartDevices()');
    // Unimplemented for now, waiting on IIT...
  }

  onApplicationBootstrap() {
    this.syncPersonalDevices();
    this.syncShortTerm();
    this.syncLongTerm();
    this.syncCartDevices();
  }
}
