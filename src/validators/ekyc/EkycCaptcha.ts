import { IsString } from '@libs/core/validator';
import { LengthEqualTo } from '../decorators';

export class EkycCaptchaValidator {
  @LengthEqualTo(32, { message: 'Invalid Transaction ID' })
  transactionId: string;

  @IsString({ message: 'Invalid Captcha' })
  @LengthEqualTo(5, { message: 'Captcha should be of 5 digits' })
  captcha: string;
}