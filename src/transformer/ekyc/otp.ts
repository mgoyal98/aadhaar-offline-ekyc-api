import { Transformer } from '@libs/core';

export class EkycCaptchaTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(otp: Record<string, any>): Promise<Record<string, any>> {
    return {
      transactionId: otp.transactionId,
      message: otp.message,
    };
  }
}
