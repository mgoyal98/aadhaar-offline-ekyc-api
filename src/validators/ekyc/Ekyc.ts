import { IsNotEmpty, IsNumber } from '@libs/core/validator';
import { LengthEqualTo } from '../decorators';

export class EkycValidator {
  @IsNotEmpty()
  @IsNumber({}, { message: 'Invalid Aadhaar Number.' })
  @LengthEqualTo(12, {
    message: 'Aadhaar Number should be of 12 digits.',
  })
  aadhaarNumber: number;
}
