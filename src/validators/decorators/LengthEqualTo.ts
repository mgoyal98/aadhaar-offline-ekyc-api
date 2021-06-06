import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class LengthEqualToConstraint implements ValidatorConstraintInterface {
  async validate(value: any | Array<any>, args: ValidationArguments) {
    const [requiredLength] = args.constraints;
    if (value) {
      return value.toString().length === requiredLength;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const property = args.property;
    const [requiredLength] = args.constraints;
    return `${property} length must be equal to ${requiredLength}`;
  }
}

export function LengthEqualTo(
  requiredLength: number | any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [requiredLength],
      validator: LengthEqualToConstraint,
    });
  };
}
