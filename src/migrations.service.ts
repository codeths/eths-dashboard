import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dirname, join } from 'path';
import { Umzug, memoryStorage } from 'umzug';

@Injectable()
export class MigrationsService {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(MigrationsService.name);

  async checkMigrations() {
    const migrations = new Umzug({
      migrations: {
        glob: this.getMigrationsGlob(),
      },
      context: {},
      storage: memoryStorage(),
      logger:
        this.configService.get('NODE_ENV') === 'production'
          ? undefined
          : console,
    });

    const pending = await migrations.pending();

    if (pending.length !== 0) {
      this.logger.warn('Running migrations...');
      console.log({ pending });
      await migrations.up();
    }
  }

  getMigrationsGlob() {
    const mainFile = process.argv[1];
    const mainDir = dirname(mainFile);
    const migrationsDir = join(mainDir, 'migrations', '*.js'); // files are compiled to js

    return migrationsDir;
  }
}
