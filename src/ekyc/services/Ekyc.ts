import {
  EkycCaptchaValidator,
  EkycValidator,
  EkycOtpValidator,
  EkycRefreshCaptchaValidator,
  EkycValidateDataValidator,
} from '@app/validators';
import { uuid, ValidationFailed } from '@libs/core';
import { BaseValidator } from '@libs/core/validator';
import {
  Injectable,
  HttpService,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Ekyc, EkycDocument } from '../schemas';
import { EkycTypes } from '@app/constants';
import { CryptoService } from '@app/helper-services';
import * as cheerio from 'cheerio';
import * as unzipper from 'unzipper';
import * as xmlToJson from 'xml-js';
import * as fs from 'fs/promises';
@Injectable()
export class EkycService {
  constructor(
    private http: HttpService,
    private config: ConfigService,
    private validator: BaseValidator,
    private crypto: CryptoService,
    @InjectModel(Ekyc.name) private ekyc: Model<EkycDocument>,
  ) {}

  UIDAI_URL = this.config.get('uidai.baseUrl');
  UIDAI_CAPTCHA_URL =
    this.UIDAI_URL +
    '/CaptchaSecurityImages.php?width=100&height=40&characters=5';

  /*======================
      Generate Captcha
  ======================*/
  async generateCaptcha(
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycValidator);

    const captchaUidaiResponse = await this.http
      .get(this.UIDAI_CAPTCHA_URL, {
        responseType: 'arraybuffer',
      })
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
    const sessionId = uuid().toString().replaceAll('-', '');

    await this.ekyc.create({
      aadhaarNumber: await this.crypto.encrypt(inputs.aadhaarNumber),
      sessionId: sessionId,
      shareCode: await this.crypto.randomBytesHex(4),
      cookies: await this.crypto.encrypt(cookies),
      isConsent: inputs.isConsent,
      createdAt: new Date(),
    });

    // Saving base64 captcha image to html to view it easily (ONLY IN LOCAL ENV)
    if (this.config.get('app').env === 'local') {
      await fs.writeFile(
        'captchaImage.html',
        '<html><body><img src="data:image/jpeg;base64,' +
          captchaImage +
          '"/></body></html>',
      );
    }

    const captchaResponse = {
      sessionId: sessionId,
      captcha: captchaImage,
    };

    return captchaResponse;
  }

  /*======================
      Refresh Captcha
  ======================*/
  async refreshCaptcha(
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycRefreshCaptchaValidator);

    const aadhaarData = await this.ekyc.findOne({
      sessionId: inputs.sessionId,
    });

    if (!aadhaarData) throw new UnauthorizedException('Invalid Session Id');

    const captchaUidaiResponse = await this.http
      .get(this.UIDAI_CAPTCHA_URL, {
        responseType: 'arraybuffer',
        headers: {
          Cookie: (await this.crypto.decrypt(aadhaarData.cookies))
            .split(',')
            .join('; '),
        },
      })
      .toPromise();

    const captchaImage = Buffer.from(
      captchaUidaiResponse.data,
      'binary',
    ).toString('base64');

    // Saving base64 captcha image to html to view it easily (ONLY IN LOCAL ENV)
    if (this.config.get('app').env === 'local') {
      await fs.writeFile(
        'captchaImage.html',
        '<html><body><img src="data:image/jpeg;base64,' +
          captchaImage +
          '"/></body></html>',
      );
    }

    const captchaResponse = {
      sessionId: inputs.sessionId,
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
      sessionId: inputs.sessionId,
    });

    if (!aadhaarData) throw new UnauthorizedException('Invalid Session Id');

    const otpUidaiResponse = await this.http
      .post(
        this.UIDAI_URL + '/offline-kyc',
        this.formUrlEncoded({
          uidno: await this.crypto.decrypt(aadhaarData.aadhaarNumber),
          security_code: inputs.captcha,
          task: EkycTypes.generateOtp,
          boxchecked: 0,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: (await this.crypto.decrypt(aadhaarData.cookies))
              .split(',')
              .join('; '),
          },
        },
      )
      .toPromise();
    const $ = cheerio.load(otpUidaiResponse.data);
    const responseData = {
      isError: $('div.alert').hasClass('alert-error'),
      message: $('.alert .alert-message').text(),
    };

    if (responseData.isError) {
      throw new ValidationFailed({ captcha: [responseData.message] });
    }

    return {
      sessionId: inputs.sessionId,
      message: responseData.message,
    };
  }

  /*======================
        Verify OTP
  ======================*/
  async verifyOtp(inputs: Record<string, any>): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycOtpValidator);

    const aadhaarData = await this.ekyc.findOne({
      sessionId: inputs.sessionId,
    });

    if (!aadhaarData)
      throw new UnauthorizedException('Unauthorized Session Id');

    const otpUidaiResponse = await this.http
      .post(
        this.UIDAI_URL + '/offline-kyc',
        this.formUrlEncoded({
          totp: inputs.otp,
          zipcode: aadhaarData.shareCode,
          task: EkycTypes.validateOtp,
          boxchecked: 0,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: (await this.crypto.decrypt(aadhaarData.cookies))
              .split(',')
              .join('; '),
          },
          decompress: false,
          responseType: 'arraybuffer',
        },
      )
      .toPromise();

    if (
      otpUidaiResponse.headers['content-type'] === 'text/html; charset=UTF-8'
    ) {
      const $ = cheerio.load(otpUidaiResponse.data);
      const message = $('.alert .alert-message').text();
      if (message) throw new BadRequestException(message);
    }

    const aadhaarZip = await unzipper.Open.buffer(otpUidaiResponse.data);

    const aadhaarXml = await aadhaarZip.files[0].buffer(aadhaarData.shareCode);

    const aadhaarJson = JSON.parse(
      xmlToJson.xml2json(aadhaarXml.toString(), { compact: true, spaces: 4 }),
    );

    await this.ekyc.updateOne(
      { sessionId: inputs.sessionId },
      { isFlowCompleted: true },
    );

    const userData = {
      isAadhaarVerified: true,
      aadhaarNumber: await this.crypto.decrypt(aadhaarData.aadhaarNumber),
      sessionId: inputs.sessionId,
      shareCode: aadhaarData.shareCode,
      mobileHash: aadhaarJson.OfflinePaperlessKyc.UidData.Poi._attributes.m,
      emailHash: aadhaarJson.OfflinePaperlessKyc.UidData.Poi._attributes.e,
      name: aadhaarJson.OfflinePaperlessKyc.UidData.Poi._attributes.name,
      gender: aadhaarJson.OfflinePaperlessKyc.UidData.Poi._attributes.gender,
      dob: aadhaarJson.OfflinePaperlessKyc.UidData.Poi._attributes.dob,
      addressDetails: aadhaarJson.OfflinePaperlessKyc.UidData.Poa._attributes,
      image: aadhaarJson.OfflinePaperlessKyc.UidData.Pht._text,
    };

    return userData;
  }

  /*======================
       Validate Data
  ======================*/
  async validateData(
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    await this.validator.fire(inputs, EkycValidateDataValidator);

    const aadhaarData = await this.ekyc.findOne({
      sessionId: inputs.sessionId,
    });

    if (!aadhaarData)
      throw new UnauthorizedException('Unauthorized Session Id');

    const aadhaarNumber = await this.crypto.decrypt(aadhaarData.aadhaarNumber);

    const numberOfHashs =
      Number(aadhaarNumber[aadhaarNumber.length - 1]) > 1
        ? Number(aadhaarNumber[aadhaarNumber.length - 1])
        : 1;

    let systemHash =
      (inputs.mobileNumber || inputs.email) + aadhaarData.shareCode;

    for (let i = 0; i < numberOfHashs; i++) {
      systemHash = await this.crypto.hashSha256(systemHash);
    }

    if (systemHash !== inputs.hash) {
      throw new BadRequestException(
        inputs.type.charAt(0).toUpperCase() +
          inputs.type.slice(1).toLowerCase() +
          ' is not valid',
      );
    }

    await this.ekyc.updateOne(
      { sessionId: inputs.sessionId },
      { isVerified: true },
    );

    return { isVerified: true, verificationType: inputs.type };
  }

  formUrlEncoded = (data: Record<string, any>): string =>
    Object.keys(data).reduce(
      (p, c) => p + `&${c}=${encodeURIComponent(data[c])}`,
      '',
    );

  addMinutesInDate(date: Date, minutes: number): Date {
    const newDate = date;
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  }
}
