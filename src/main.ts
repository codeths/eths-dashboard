import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as mongoStore from 'connect-mongodb-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('APP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const MongoDBStore = mongoStore(session);
  const store = new MongoDBStore({
    uri: config.getOrThrow('MONGO_URL'),
    collection: 'sessions',
  });
  const proxySetting = config.get('TRUST_PROXIES');
  if (proxySetting) {
    const proxySettingInt = parseInt(proxySetting);
    app.set('trust proxy', proxySettingInt || proxySetting);
    logger.log(`Proxy config set: ${proxySettingInt || proxySetting}`);
  }
  app.use(
    session({
      secret: config.getOrThrow('SESSION_SECRET'),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: config.get('NODE_ENV') === 'production',
      },
      store,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.session());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (config.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dashboard API')
      .setDescription(
        `Please make sure you reference the data transfer types in common/*.
      The OpenAPI types are best effort and don't always get everything right.`,
      )
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
