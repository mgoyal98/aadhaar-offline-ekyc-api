import { IsNumber } from '@libs/core/validator';
import { LengthEqualTo } from '../decorators';

export class EkycOtpValidator {
  @LengthEqualTo(32, { message: 'Invalid Session ID' })
  sessionId: string;

  @IsNumber({}, { message: 'Invalid OTP' })
  @LengthEqualTo(6, { message: 'OTP should be of 6 digits' })
  otp: number;
}
