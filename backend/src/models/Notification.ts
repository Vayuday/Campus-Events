import { Schema, model, Document, Types } from "mongoose";

export interface NotificationDoc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  body: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Notification = model<NotificationDoc>(
  "Notification",
  notificationSchema
);
