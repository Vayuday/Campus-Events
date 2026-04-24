import { Schema, model, Document, Types } from "mongoose";

export type EventStatus = "pending" | "approved" | "rejected";

export interface EventDoc extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: Types.ObjectId | null;
  venue: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  posterUrl?: string;
  organizer: Types.ObjectId;
  status: EventStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    venue: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    posterUrl: { type: String, trim: true },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

eventSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Event = model<EventDoc>("Event", eventSchema);
