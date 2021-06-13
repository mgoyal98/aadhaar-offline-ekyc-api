import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EkycDocument = Ekyc & Document;

@Schema()
export class Ekyc {
  @Prop({ required: true })
  aadhaarNumber: string;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop()
  cookies: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const EkycSchema = SchemaFactory.createForClass(Ekyc);
