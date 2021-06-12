import { Transformer } from '@libs/core';

export class EkycOtpTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(otp: Record<string, any>): Promise<Record<string, any>> {
    return {
      transactionId: otp.transactionId,
      message: otp.message,
    };
  }
}
