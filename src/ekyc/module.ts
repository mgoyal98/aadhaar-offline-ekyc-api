import { Module, HttpModule } from '@nestjs/common';
import { EkycController } from './controllers';
import { EkycService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import { Ekyc, EkycSchema } from './schemas';
import { CryptoService } from '@app/helper-services';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Ekyc.name, schema: EkycSchema }]),
  ],
  controllers: [EkycController],
  providers: [EkycService, CryptoService],
})
export class UserModule {}
