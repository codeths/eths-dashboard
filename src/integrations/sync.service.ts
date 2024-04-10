import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

export const DeviceRefreshRates = {
  personal: 60 * 60_000,
  shortTerm: 2 * 60_000,
  longTerm: 5 * 60_000,
  cart: 24 * 60 * 60_000,
};

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SyncService.name);

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
