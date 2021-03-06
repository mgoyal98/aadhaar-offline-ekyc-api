import { Transformer } from '@libs/core';

export class EkycDataTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(data: Record<string, any>): Promise<Record<string, any>> {
    return {
      isAadhaarVerified: data.isAadhaarVerified,
      aadhaarNumber: data.aadhaarNumber,
      sessionId: data.sessionId,
      shareCode: data.shareCode,
      mobileHash: data.mobileHash,
      emailHash: data.emailHash,
      name: data.name,
      gender: data.gender,
      dob: data.dob,
      addressDetails: data.addressDetails,
      image: data.image,
    };
  }
}
