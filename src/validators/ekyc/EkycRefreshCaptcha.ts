import { LengthEqualTo } from '../decorators';

export class EkycRefreshCaptchaValidator {
  @LengthEqualTo(32, { message: 'Invalid Session ID' })
  sessionId: string;
}
