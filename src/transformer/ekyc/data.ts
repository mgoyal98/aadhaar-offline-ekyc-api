import { Transformer } from '@libs/core';

export class EkycDataTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(data: Record<string, any>): Promise<Record<string, any>> {
    return {
      isAadhaarVerified: data.isAadhaarVerified,
      aadhaarNumber: data.aadhaarNumber,
      name: data.name,
      gender: data.gender,
      dob: data.dob,
      addressDetails: data.addressDetails,
      image: data.image,
    };
  }
}
