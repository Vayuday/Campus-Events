import { Types } from "mongoose";
import { Notification } from "../models/Notification";

export interface NotifyPayload {
  title: string;
  body: string;
}

/**
 * Mock notification service. Persists an in-app inbox entry for each user and
 * logs the dispatch. Swap this implementation for Firebase Cloud Messaging by
 * replacing the body of sendToUsers while keeping the same signature.
 */
export async function sendToUsers(
  userIds: (Types.ObjectId | string)[],
  payload: NotifyPayload
): Promise<number> {
  if (userIds.length === 0) return 0;

  const docs = userIds.map((id) => ({
    user: typeof id === "string" ? new Types.ObjectId(id) : id,
    title: payload.title,
    body: payload.body,
  }));

  await Notification.insertMany(docs);

  // eslint-disable-next-line no-console
  console.log(
    `[MOCK FCM] Sent "${payload.title}" to ${userIds.length} user(s)`
  );

  return docs.length;
}

export async function sendToUser(
  userId: Types.ObjectId | string,
  payload: NotifyPayload
): Promise<void> {
  await sendToUsers([userId], payload);
}
