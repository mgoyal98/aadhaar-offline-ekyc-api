import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CryptoService {
  constructor(private config: ConfigService) {}

  key = this.config.get('crypto').key;
  iv = this.config.get('crypto').iv;

  async encrypt(textToEncrypt: any) {
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(this.key, 'hex'),
      Buffer.from(this.iv, 'hex'),
    );
    cipher.setEncoding('hex');
    return Buffer.concat([
      cipher.update(textToEncrypt.toString()),
      cipher.final(),
    ]).toString('hex');
  }

  async decrypt(encryptedText: any) {
    const decipher = createDecipheriv(
      'aes-256-ctr',
      Buffer.from(this.key, 'hex'),
      Buffer.from(this.iv, 'hex'),
    );
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'hex')),
      decipher.final(),
    ]).toString();
  }
}
