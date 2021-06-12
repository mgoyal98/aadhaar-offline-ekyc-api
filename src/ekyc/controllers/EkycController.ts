import { ApiController, Request, Response } from '@libs/core';
import { Controller, Post, Req, Res } from '@nestjs/common';
import { EkycService } from '../services';
import { EkycCaptchaTransformer } from '@app/transformer';

@Controller('ekyc')
export class EkycController extends ApiController {
  constructor(private ekyc: EkycService) {
    super();
  }

  @Post('/captcha')
  async generateCaptcha(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const user = await this.ekyc.generateCaptcha(req.all());
    return res.success(
      await this.transform(user, new EkycCaptchaTransformer(), { req }),
    );
  }
}
