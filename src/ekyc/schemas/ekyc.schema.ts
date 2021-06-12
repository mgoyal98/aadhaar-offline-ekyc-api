import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EkycDocument = Ekyc & Document;

@Schema()
export class Ekyc {
  @Prop({ required: true })
  aadhaarNumber: number;

  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop([String])
  cookies: string[];

  @Prop({ required: true })
  expiresAt: Date;
}

export const EkycSchema = SchemaFactory.createForClass(Ekyc);
