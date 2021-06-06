import { registerAs } from '@nestjs/config';

export default registerAs('uidai', () => ({
  baseUrl: process.env.UIDAI_BASE_URL || 'https://resident.uidai.gov.in',
}));
