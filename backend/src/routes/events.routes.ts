import { Router } from "express";
import { Types } from "mongoose";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { User } from "../models/User";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import {
  approveSchema,
  createEventSchema,
  notifySchema,
  updateEventSchema,
} from "../validators/schemas";
import { sendToUsers, sendToUser } from "../services/notifications";

const router = Router();

async function attachCounts(events: any[]): Promise<any[]> {
  if (events.length === 0) return events;
  const ids = events.map((e) => e._id);
  const counts = await Registration.aggregate([
    { $match: { event: { $in: ids } } },
    { $group: { _id: "$event", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id.toString(), c.count]));
  return events.map((e) => ({
    ...e.toJSON(),
    registeredCount: map.get(e._id.toString()) ?? 0,
  }));
}

/**
 * Public listing. If no auth (or student), only approved events shown.
 * Organizer/admin can optionally pass ?all=1 for broader view.
 */
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { category, search, status, mine } = req.query as Record<
      string,
      string | undefined
    >;

    const query: Record<string, unknown> = {};
    const isPrivileged =
      req.user?.role === "organizer" || req.user?.role === "admin";

    if (!isPrivileged) {
      query.status = "approved";
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }
    if (mine === "1" && req.user) {
      query.organizer = req.user.sub;
    }

    const events = await Event.find(query)
      .populate("category", "name slug")
      .populate("organizer", "name email")
      .sort({ startAt: 1 });

    const withCounts = await attachCounts(events);
    res.json({ events: withCounts });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
      .populate("category", "name slug")
      .populate("organizer", "name email");
    if (!event) throw new HttpError(404, "Event not found");

    const isPrivileged =
      req.user?.role === "admin" ||
      (req.user?.role === "organizer" &&
        event.organizer &&
        (event.organizer as any)._id.toString() === req.user.sub);

    if (event.status !== "approved" && !isPrivileged) {
      throw new HttpError(404, "Event not found");
    }

    const registeredCount = await Registration.countDocuments({
      event: event._id,
    });

    let alreadyRegistered = false;
    if (req.user?.role === "student") {
      alreadyRegistered = !!(await Registration.exists({
        event: event._id,
        student: req.user.sub,
      }));
    }

    res.json({
      event: { ...event.toJSON(), registeredCount },
      alreadyRegistered,
    });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const input = createEventSchema.parse(req.body);
    if (input.endAt <= input.startAt) {
      throw new HttpError(400, "endAt must be after startAt");
    }
    const event = await Event.create({
      title: input.title,
      description: input.description,
      category: input.category || null,
      venue: input.venue,
      startAt: input.startAt,
      endAt: input.endAt,
      capacity: input.capacity,
      posterUrl: input.posterUrl || undefined,
      organizer: req.user!.sub,
      status: req.user!.role === "admin" ? "approved" : "pending",
    });
    res.status(201).json({ event: event.toJSON() });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, "Event not found");
    if (
      req.user!.role === "organizer" &&
      event.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }
    const input = updateEventSchema.parse(req.body);
    Object.assign(event, input);
    if (input.category === "") event.category = null;
    if (req.user!.role === "organizer" && event.status === "rejected") {
      event.status = "pending";
      event.rejectionReason = undefined;
    }
    await event.save();
    res.json({ event: event.toJSON() });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, "Event not found");
    if (
      req.user!.role === "organizer" &&
      event.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();
    res.json({ ok: true });
  })
);

router.patch(
  "/:id/review",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const input = approveSchema.parse(req.body);
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, "Event not found");
    event.status = input.status;
    event.rejectionReason =
      input.status === "rejected" ? input.rejectionReason : undefined;
    await event.save();

    await sendToUser(event.organizer, {
      title:
        input.status === "approved"
          ? `Event approved: ${event.title}`
          : `Event rejected: ${event.title}`,
      body:
        input.status === "approved"
          ? `Your event "${event.title}" is now live for students to register.`
          : `Reason: ${input.rejectionReason ?? "Not specified"}`,
    });

    res.json({ event: event.toJSON() });
  })
);

router.get(
  "/:id/participants",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, "Event not found");
    if (
      req.user!.role === "organizer" &&
      event.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }
    const regs = await Registration.find({ event: event._id })
      .populate("student", "name email")
      .sort({ createdAt: 1 });
    res.json({ registrations: regs.map((r) => r.toJSON()) });
  })
);

router.post(
  "/:id/notify",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const payload = notifySchema.parse(req.body);
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, "Event not found");
    if (
      req.user!.role === "organizer" &&
      event.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }
    const regs = await Registration.find({ event: event._id }).select(
      "student"
    );
    const userIds = regs.map((r) => r.student);
    const count = await sendToUsers(userIds, payload);
    res.json({ delivered: count });
  })
);

export default router;
