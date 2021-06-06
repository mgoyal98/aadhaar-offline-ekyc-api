import { ApiController, Request, Response } from '@libs/core';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { EkycService } from '../services';
import { EkycCaptchaTransformer } from '@app/transformer';

@Controller('ekyc')
export class EkycController extends ApiController {
  constructor(private ekyc: EkycService) {
    super();
  }

  @Post('/')
  async getCaptcha(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const user = await this.ekyc.getCaptcha(req.all());
    return res.success(
      await this.transform(user, new EkycCaptchaTransformer(), { req }),
    );
  }
}
