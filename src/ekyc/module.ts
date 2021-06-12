import { Module, HttpModule } from '@nestjs/common';
import { EkycController } from './controllers';
import { EkycService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import { Ekyc, EkycSchema } from './schemas';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Ekyc.name, schema: EkycSchema }]),
  ],
  controllers: [EkycController],
  providers: [EkycService],
})
export class UserModule {}
