import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ExtController } from './ext.controller';
import { ExtService } from './ext.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchemasModule } from 'src/schemas/schemas.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthTokenLifespanDays } from './ext.constants';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('EXT_JWT_SECRET'),
        verifyOptions: {
          maxAge: `${AuthTokenLifespanDays}d`,
        },
      }),
      inject: [ConfigService],
    }),
    SchemasModule,
    FirebaseModule,
  ],
  providers: [ExtService],
  controllers: [ExtController],
})
export class ExtModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes(ExtController);
  }
}
