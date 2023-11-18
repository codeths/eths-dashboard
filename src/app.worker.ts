import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { FirebaseToken } from './schemas/FirebaseToken.schema';
import { DeviceDocument } from './schemas/Device.schema';
import { FirebaseService } from './firebase/firebase.service';

@Injectable()
export class AppWorker implements OnApplicationBootstrap {
  constructor(
    @InjectModel(FirebaseToken.name)
    private readonly firebaseTokenModel: Model<FirebaseToken>,
    private readonly firebaseService: FirebaseService,
  ) {}
  private readonly logger = new Logger(AppWorker.name);

  onApplicationBootstrap() {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'firebase' })
  async removeOldFirebaseTokens() {
    this.logger.verbose('Removing old Firebase tokens...');

    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() - 2);
    const expiredTokens = await this.firebaseTokenModel
      .find({
        lastUsed: { $lt: expiration },
      })
      .populate<{ device: DeviceDocument }>('device');

    const jobs = expiredTokens.map(
      async ({ token, device: { serialNumber } }) => {
        this.logger.debug(`Firebase Token: ${token}`);
        this.logger.debug(`Device: ${serialNumber}`);
        await this.firebaseService.unsubscribe(serialNumber, token);
      },
    );
    await Promise.all(jobs);

    const { deletedCount } = await this.firebaseTokenModel
      .deleteMany()
      .where('_id')
      .in(expiredTokens.map((e) => e._id));
    this.logger.verbose(
      `Removed ${deletedCount} token${deletedCount === 1 ? '' : 's'}`,
    );
  }
}
