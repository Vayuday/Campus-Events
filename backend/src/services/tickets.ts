import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { env } from "../config/env";

export interface TicketPayload {
  registrationId: string;
  ticketCode: string;
  eventId: string;
  studentId: string;
}

export function signTicket(payload: TicketPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    issuer: "campus-events",
    subject: "ticket",
  });
}

export function verifyTicket(token: string): TicketPayload {
  return jwt.verify(token, env.jwtSecret, {
    issuer: "campus-events",
    subject: "ticket",
  }) as TicketPayload;
}

export async function ticketQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 480,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
