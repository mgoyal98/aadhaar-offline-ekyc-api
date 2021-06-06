import { EkycValidator } from '@app/validators';
import { uuid } from '@libs/core';
import { BaseValidator } from '@libs/core/validator';
import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EkycService {
  constructor(
    private http: HttpService,
    private config: ConfigService,
    private validator: BaseValidator,
  ) {}

  UIDAI_URL = this.config.get('uidai.baseUrl');

  async getCaptcha(inputs: Record<string, any>): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycValidator);
    const captcha = await this.http
      .get(
        this.UIDAI_URL +
          '/CaptchaSecurityImages.php?width=100&height=40&characters=5',
        {
          responseType: 'arraybuffer',
        },
      )
      .toPromise();
    const captchaImage = Buffer.from(captcha.data, 'binary').toString('base64');
    const cookies = captcha.headers['set-cookie'].map((cookie: string) => {
      return cookie.split(';')[0];
    });

    const captchaResponse = {
      transactionId: uuid().toString().replaceAll('-', ''),
      captcha: captchaImage,
    };

    return captchaResponse;
  }
}
