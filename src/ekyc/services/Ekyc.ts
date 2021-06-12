import { EkycCaptchaValidator, EkycValidator } from '@app/validators';
import { uuid, ValidationFailed } from '@libs/core';
import { BaseValidator } from '@libs/core/validator';
import { Injectable, HttpService, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Ekyc, EkycDocument } from '../schemas';
import { EkycTypes } from '@app/constants';
import * as cheerio from 'cheerio';
@Injectable()
export class EkycService {
  constructor(
    private http: HttpService,
    private config: ConfigService,
    private validator: BaseValidator,
    @InjectModel(Ekyc.name) private ekyc: Model<EkycDocument>,
  ) {}

  UIDAI_URL = this.config.get('uidai.baseUrl');

  formUrlEncoded = (data: Record<string, any>) =>
    Object.keys(data).reduce(
      (p, c) => p + `&${c}=${encodeURIComponent(data[c])}`,
      '',
    );

  /*======================
      Generate Captcha
  ======================*/
  async generateCaptcha(
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycValidator);

    const captchaUidaiResponse = await this.http
      .get(
        this.UIDAI_URL +
          '/CaptchaSecurityImages.php?width=100&height=40&characters=5',
        {
          responseType: 'arraybuffer',
        },
      )
      .toPromise();

    const captchaImage = Buffer.from(
      captchaUidaiResponse.data,
      'binary',
    ).toString('base64');
    const cookies = captchaUidaiResponse.headers['set-cookie'].map(
      (cookie: string) => {
        return cookie.split(';')[0];
      },
    );
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
  }

  /*======================
        Generate OTP
  ======================*/
  async generateOtp(inputs: Record<string, any>): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycCaptchaValidator);

    const aadhaarData = await this.ekyc.findOne({
      transactionId: inputs.transactionId,
    });

    if (!aadhaarData)
      throw new UnauthorizedException('Unauthorized Transaction Id');

    const otpUidaiResponse = await this.http
      .post(
        this.UIDAI_URL + '/offline-kyc',
        this.formUrlEncoded({
          uidno: aadhaarData.aadhaarNumber,
          security_code: inputs.captcha,
          task: EkycTypes.generateOtp,
          boxchecked: 0,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: aadhaarData.cookies.join('; '),
          },
        },
      )
      .toPromise();
    const $ = cheerio.load(otpUidaiResponse.data);
    console.log($('div#system-message').html());
    console.log($('div.alert').html());
    const responseData = {
      isError: $('div.alert').hasClass('alert-error'),
      message: $('.alert .alert-message').text(),
    };

    if (responseData.isError) {
      throw new ValidationFailed({ captcha: [responseData.message] });
    }

    return {
      transactionId: inputs.transactionId,
      message: responseData.message,
    };
  }
}
