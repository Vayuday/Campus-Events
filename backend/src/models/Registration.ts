import { Schema, model, Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface RegistrationDoc extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  student: Types.ObjectId;
  ticketCode: string;
  checkedInAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<RegistrationDoc>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

registrationSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Registration = model<RegistrationDoc>(
  "Registration",
  registrationSchema
);
