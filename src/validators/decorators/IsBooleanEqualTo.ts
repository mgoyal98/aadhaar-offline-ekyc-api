import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class IsBooleanEqualToConstrain implements ValidatorConstraintInterface {
  async validate(value: boolean, args: ValidationArguments) {
    const [requiredBoolean] = args.constraints;
    return value === requiredBoolean;
  }

  defaultMessage(args: ValidationArguments) {
    const property = args.property;
    const [relatedPropertyName] = args.constraints;
    return `${property} should be ${relatedPropertyName}`;
  }
}

export function IsBooleanEqualTo(
  property: boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBooleanEqualToConstrain,
    });
  };
}
