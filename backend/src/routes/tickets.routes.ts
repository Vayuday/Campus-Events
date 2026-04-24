import { Router } from "express";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { User } from "../models/User";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { verifyTicketSchema } from "../validators/schemas";
import { signTicket, ticketQrDataUrl, verifyTicket } from "../services/tickets";

const router = Router();

router.get(
  "/:registrationId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const reg = await Registration.findById(req.params.registrationId)
      .populate("event")
      .populate("student", "name email");
    if (!reg) throw new HttpError(404, "Ticket not found");

    const studentId = (reg.student as any)._id
      ? (reg.student as any)._id.toString()
      : reg.student.toString();

    const isOwner = req.user!.sub === studentId;
    const event = reg.event as any;
    const isOrganizer =
      req.user!.role === "organizer" &&
      event?.organizer?.toString() === req.user!.sub;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new HttpError(403, "Forbidden");
    }

    const token = signTicket({
      registrationId: reg._id.toString(),
      ticketCode: reg.ticketCode,
      eventId: event._id.toString(),
      studentId,
    });
    const qr = await ticketQrDataUrl(token);

    res.json({
      ticket: {
        token,
        qr,
        registration: reg.toJSON(),
        event: event.toJSON ? event.toJSON() : event,
      },
    });
  })
);

router.post(
  "/verify",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const { token } = verifyTicketSchema.parse(req.body);

    let payload;
    try {
      payload = verifyTicket(token);
    } catch {
      throw new HttpError(400, "Invalid ticket signature");
    }

    const reg = await Registration.findById(payload.registrationId);
    if (!reg) throw new HttpError(404, "Registration not found");
    if (reg.ticketCode !== payload.ticketCode) {
      throw new HttpError(400, "Ticket code mismatch");
    }

    const event = await Event.findById(payload.eventId);
    if (!event) throw new HttpError(404, "Event not found");

    if (
      req.user!.role === "organizer" &&
      event.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }

    const student = await User.findById(payload.studentId).select("name email");

    const alreadyCheckedIn = !!reg.checkedInAt;
    if (!alreadyCheckedIn) {
      reg.checkedInAt = new Date();
      await reg.save();
    }

    res.json({
      valid: true,
      alreadyCheckedIn,
      checkedInAt: reg.checkedInAt,
      student: student ? { id: student.id, name: student.name, email: student.email } : null,
      event: { id: event._id.toString(), title: event.title, venue: event.venue },
    });
  })
);

export default router;
