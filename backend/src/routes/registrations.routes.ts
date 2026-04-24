import { Router } from "express";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { sendToUser } from "../services/notifications";

const router = Router();

router.post(
  "/events/:eventId/register",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) throw new HttpError(404, "Event not found");
    if (event.status !== "approved") {
      throw new HttpError(400, "Event is not open for registration");
    }
    if (event.endAt < new Date()) {
      throw new HttpError(400, "Event already ended");
    }

    const existing = await Registration.findOne({
      event: event._id,
      student: req.user!.sub,
    });
    if (existing) throw new HttpError(409, "Already registered");

    const count = await Registration.countDocuments({ event: event._id });
    if (count >= event.capacity) {
      throw new HttpError(400, "Event is full");
    }

    const reg = await Registration.create({
      event: event._id,
      student: req.user!.sub,
    });

    await sendToUser(req.user!.sub, {
      title: `Registered: ${event.title}`,
      body: `Your ticket is ready. See you at ${event.venue}.`,
    });

    res.status(201).json({ registration: reg.toJSON() });
  })
);

router.delete(
  "/events/:eventId/register",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const reg = await Registration.findOneAndDelete({
      event: req.params.eventId,
      student: req.user!.sub,
    });
    if (!reg) throw new HttpError(404, "Not registered");
    res.json({ ok: true });
  })
);

router.get(
  "/me/registrations",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const regs = await Registration.find({ student: req.user!.sub })
      .populate({
        path: "event",
        populate: [
          { path: "category", select: "name slug" },
          { path: "organizer", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const upcoming: any[] = [];
    const past: any[] = [];
    for (const r of regs) {
      const ev = r.event as any;
      if (!ev) continue;
      const item = r.toJSON();
      if (new Date(ev.endAt) >= now) upcoming.push(item);
      else past.push(item);
    }

    res.json({ upcoming, past });
  })
);

export default router;
