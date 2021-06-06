import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class MaxLengthAllConstraint implements ValidatorConstraintInterface {
  async validate(value: any | Array<any>, args: ValidationArguments) {
    const [maxLength] = args.constraints;
    if (value) {
      return value.toString().length <= maxLength;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const property = args.property;
    const [maxLength] = args.constraints;
    return `${property} length must be lesser than or equal to ${maxLength}`;
  }
}

export function MaxLengthAll(
  maxLength: number | any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxLength],
      validator: MaxLengthAllConstraint,
    });
  };
}
