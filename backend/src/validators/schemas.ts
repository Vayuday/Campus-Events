import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["student", "organizer", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1),
  category: z.string().optional().nullable(),
  venue: z.string().min(1),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  capacity: z.number().int().min(1),
  posterUrl: z.string().url().optional().or(z.literal("")),
});

export const updateEventSchema = createEventSchema.partial();

export const approveSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
});

export const notifySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(1000),
});

export const verifyTicketSchema = z.object({
  token: z.string().min(1),
});
