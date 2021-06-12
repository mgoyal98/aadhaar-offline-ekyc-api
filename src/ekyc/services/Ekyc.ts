import { EkycValidator } from '@app/validators';
import { uuid } from '@libs/core';
import { BaseValidator } from '@libs/core/validator';
import {
  Injectable,
  HttpService,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Ekyc, EkycDocument } from '../schemas';
@Injectable()
export class EkycService {
  constructor(
    private http: HttpService,
    private config: ConfigService,
    private validator: BaseValidator,
    @InjectModel(Ekyc.name) private ekyc: Model<EkycDocument>,
  ) {}

  UIDAI_URL = this.config.get('uidai.baseUrl');

  async generateCaptcha(
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycValidator);

    return await this.http
      .get(
        this.UIDAI_URL +
          '/CaptchaSecurityImages.php?width=100&height=40&characters=5',
        {
          responseType: 'arraybuffer',
        },
      )
      .toPromise()
      .then(async (data) => {
        const captchaImage = Buffer.from(data.data, 'binary').toString(
          'base64',
        );
        const cookies = data.headers['set-cookie'].map((cookie: string) => {
          return cookie.split(';')[0];
        });
        const transactionId = uuid().toString().replaceAll('-', '');

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // timestamp

        await this.ekyc.create({
          aadhaarNumber: inputs.aadhaarNumber,
          transactionId: transactionId,
          cookies: cookies,
          expiresAt: new Date(expiresAt),
        });

        const captchaResponse = {
          transactionId: transactionId,
          captcha: captchaImage,
        };

        return captchaResponse;
      })
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException();
      });
  }
}
