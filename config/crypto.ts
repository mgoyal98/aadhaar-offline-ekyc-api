import { registerAs } from '@nestjs/config';

export default registerAs('crypto', () => ({
  key:
    process.env.CRYPTO_KEY ||
    '71690f4fff3759461d9ba543ceabfe2dafd70c2728ed88155667d3990ed29d10',
  iv: process.env.CRYPTO_IV || 'b6bc9f82aa9799509a22767ea8638dca',
}));
