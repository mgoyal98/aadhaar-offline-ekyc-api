import { ApiController, Request, Response } from '@libs/core';
import { Controller, Post, Req, Res } from '@nestjs/common';
import { EkycService } from '../services';
import { EkycCaptchaTransformer, EkycOtpTransformer } from '@app/transformer';
import { EkycDataTransformer } from '@app/transformer/ekyc/data';

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
    const captcha = await this.ekyc.generateCaptcha(req.all());
    return res.success(
      await this.transform(captcha, new EkycCaptchaTransformer(), { req }),
    );
  }

  @Post('/captcha/refresh')
  async refreshCaptcha(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const captcha = await this.ekyc.refreshCaptcha(req.all());
    return res.success(
      await this.transform(captcha, new EkycCaptchaTransformer(), { req }),
    );
  }

  @Post('/otp')
  async generateOtp(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const otp = await this.ekyc.generateOtp(req.all());
    return res.success(
      await this.transform(otp, new EkycOtpTransformer(), { req }),
    );
  }

  @Post('/data')
  async verifyOtp(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const aadhaarData = await this.ekyc.verifyOtp(req.all());
    return res.success(
      await this.transform(aadhaarData, new EkycDataTransformer(), { req }),
    );
  }
}
