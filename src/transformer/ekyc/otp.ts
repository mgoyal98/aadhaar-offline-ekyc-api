import { Transformer } from '@libs/core';

export class EkycOtpTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(otp: Record<string, any>): Promise<Record<string, any>> {
    return {
      sessionId: otp.sessionId,
      message: otp.message,
    };
  }
}
