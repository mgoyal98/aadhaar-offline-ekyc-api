import { EkycValidateTypes } from '@app/constants';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from '@libs/core/validator';
import { LengthEqualTo } from '../decorators';

export class EkycValidateDataValidator {
  @LengthEqualTo(32, { message: 'Invalid Session ID' })
  sessionId: string;

  @IsNotEmpty()
  @IsEnum(EkycValidateTypes)
  type: string;

  @ValidateIf((o) => o.type === EkycValidateTypes.MOBILE)
  @IsNumber()
  @LengthEqualTo(10, { message: 'Mobile Number should be of 10 digits' })
  mobileNumber: number;

  @ValidateIf((o) => o.type === EkycValidateTypes.EMAIL)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  hash: string;
}
