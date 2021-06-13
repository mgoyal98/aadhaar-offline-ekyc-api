import { IsBoolean, IsNotEmpty, IsNumber } from '@libs/core/validator';
import { LengthEqualTo, IsBooleanEqualTo } from '../decorators';

export class EkycValidator {
  @IsNotEmpty()
  @IsNumber({}, { message: 'Invalid Aadhaar Number.' })
  @LengthEqualTo(12, {
    message: 'Aadhaar Number should be of 12 digits.',
  })
  aadhaarNumber: number;

  @IsBoolean()
  @IsBooleanEqualTo(true, {
    message: 'Sorry, We cannot process your E-Kyc without your consent',
  })
  isConsent: boolean;
}
