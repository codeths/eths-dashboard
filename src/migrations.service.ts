import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { dirname, join } from 'path';
import { MigrationFn, MongoDBStorage, Umzug } from 'umzug';

interface MigrationContext {
  moduleRef: ModuleRef;
  mongoose: Connection;
}
export type MigrationAction = MigrationFn<MigrationContext>;

@Injectable()
export class MigrationsService {
  constructor(
    private readonly configService: ConfigService,
    private moduleRef: ModuleRef,
    @InjectConnection() private connection: Connection,
  ) {}
  private readonly logger = new Logger(MigrationsService.name);

  async checkMigrations() {
    const migrations = new Umzug<MigrationContext>({
      migrations: {
        glob: this.getMigrationsGlob(),
      },
      context: { moduleRef: this.moduleRef, mongoose: this.connection },
      storage: new MongoDBStorage({ connection: this.connection.db }),
      logger:
        this.configService.get('NODE_ENV') === 'production'
          ? undefined
          : console,
    });

    const pending = await migrations.pending();

    if (pending.length !== 0) {
      this.logger.warn('Running migrations...');
      console.log(
        'pending:',
        pending.map((e) => e.name),
      );
      try {
        await migrations.up();
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }
  }

  getMigrationsGlob() {
    const mainFile = process.argv[1];
    const mainDir = dirname(mainFile);
    const migrationsDir = join(mainDir, 'migrations', '*.js'); // files are compiled to js

    return migrationsDir;
  }
}
