import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventModule } from '@squareboat/nest-events';
import { UserModule } from './ekyc';
import { DbModule } from './_db';
import config from '@config/index';
import { CoreModule } from '@libs/core';
import { ConsoleModule } from '@squareboat/nest-console';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    DbModule,
    CoreModule,
    UserModule,
    EventModule,
    ConsoleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: config,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigService],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('db'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
