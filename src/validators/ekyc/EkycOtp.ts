import { IsNumber } from '@libs/core/validator';
import { LengthEqualTo } from '../decorators';

export class EkycOtpValidator {
  @LengthEqualTo(32, { message: 'Invalid Transaction ID' })
  transactionId: string;

  @IsNumber({}, { message: 'Invalid Sharecode' })
  @LengthEqualTo(4, { message: 'Sharecode should be of 4 digits' })
  shareCode: number;

  @IsNumber({}, { message: 'Invalid OTP' })
  @LengthEqualTo(6, { message: 'OTP should be of 6 digits' })
  otp: number;
}
