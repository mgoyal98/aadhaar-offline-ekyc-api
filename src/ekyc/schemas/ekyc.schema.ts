import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EkycDocument = Ekyc & Document;

@Schema()
export class Ekyc {
  @Prop({ required: true })
  aadhaarNumber: string;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: true })
  shareCode: string;

  @Prop()
  cookies: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const EkycSchema = SchemaFactory.createForClass(Ekyc);
