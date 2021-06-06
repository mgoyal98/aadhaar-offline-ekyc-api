import { Module, HttpModule } from '@nestjs/common';
import { EkycController } from './controllers';
import { EkycService } from './services';

@Module({
  imports: [HttpModule],
  controllers: [EkycController],
  providers: [EkycService],
})
export class UserModule {}
