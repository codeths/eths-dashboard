import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExtModule } from './ext/ext.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppWorker } from './app.worker';
import { SchemasModule } from './schemas/schemas.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { WebModule } from './web/web.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { MigrationsService } from './migrations.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend-dist'),
      exclude: ['/api/(.*)'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExtModule,
    FirebaseModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.getOrThrow<string>('MONGO_URL'),
        };
      },
      inject: [ConfigService],
    }),
    SchemasModule,
    ScheduleModule.forRoot(),
    AuthModule,
    WebModule,
    IntegrationsModule,
  ],
  controllers: [],
  providers: [AppWorker, MigrationsService],
})
export class AppModule {}
