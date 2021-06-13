import { Transformer } from '@libs/core';

export class EkycCaptchaTransformer extends Transformer {
  availableIncludes = [];
  defaultIncludes = [];

  async transform(captcha: Record<string, any>): Promise<Record<string, any>> {
    return {
      sessionId: captcha.sessionId,
      captcha: captcha.captcha,
    };
  }
}
