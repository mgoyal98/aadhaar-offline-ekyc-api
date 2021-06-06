import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class MinLengthAllConstraint implements ValidatorConstraintInterface {
  async validate(value: any | Array<any>, args: ValidationArguments) {
    const [minLength] = args.constraints;
    if (value) {
      return value.toString().length >= minLength;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const property = args.property;
    const [minLength] = args.constraints;
    return `${property} length must be longer than or equal to ${minLength}`;
  }
}

export function MinLengthAll(
  minLength: number | any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minLength],
      validator: MinLengthAllConstraint,
    });
  };
}
