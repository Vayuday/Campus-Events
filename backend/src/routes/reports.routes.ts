import { Router } from "express";
import { Parser } from "json2csv";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { Category } from "../models/Category";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";

const router = Router();

function sendCsv(res: any, rows: any[], filename: string): void {
  const parser = new Parser();
  const csv = rows.length
    ? parser.parse(rows)
    : "message\nNo data available";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

router.get(
  "/participation",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const events = await Event.find()
      .populate("category", "name")
      .populate("organizer", "name email");

    const counts = await Registration.aggregate([
      {
        $group: {
          _id: "$event",
          registered: { $sum: 1 },
          checkedIn: {
            $sum: { $cond: [{ $ifNull: ["$checkedInAt", false] }, 1, 0] },
          },
        },
      },
    ]);
    const countMap = new Map(
      counts.map((c) => [c._id.toString(), { registered: c.registered, checkedIn: c.checkedIn }])
    );

    const rows = events.map((ev) => {
      const c = countMap.get(ev._id.toString()) ?? { registered: 0, checkedIn: 0 };
      return {
        event_id: ev._id.toString(),
        title: ev.title,
        status: ev.status,
        category: (ev.category as any)?.name ?? "",
        organizer: (ev.organizer as any)?.name ?? "",
        venue: ev.venue,
        startAt: ev.startAt.toISOString(),
        endAt: ev.endAt.toISOString(),
        capacity: ev.capacity,
        registered: c.registered,
        checkedIn: c.checkedIn,
        fillRate:
          ev.capacity > 0
            ? Math.round((c.registered / ev.capacity) * 100) + "%"
            : "n/a",
      };
    });

    sendCsv(res, rows, "participation.csv");
  })
);

router.get(
  "/events/:id/registrations",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(async (req, res) => {
    const ev = await Event.findById(req.params.id);
    if (!ev) throw new HttpError(404, "Event not found");
    if (
      req.user!.role === "organizer" &&
      ev.organizer.toString() !== req.user!.sub
    ) {
      throw new HttpError(403, "Not your event");
    }
    const regs = await Registration.find({ event: ev._id }).populate(
      "student",
      "name email"
    );

    const rows = regs.map((r) => ({
      registration_id: r._id.toString(),
      ticketCode: r.ticketCode,
      student_name: (r.student as any)?.name ?? "",
      student_email: (r.student as any)?.email ?? "",
      registeredAt: r.createdAt.toISOString(),
      checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : "",
    }));

    sendCsv(res, rows, `event-${ev._id}-registrations.csv`);
  })
);

router.get(
  "/categories",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const cats = await Category.find();
    const byCat = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          events: { $sum: 1 },
        },
      },
    ]);
    const regs = await Registration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "ev",
        },
      },
      { $unwind: "$ev" },
      {
        $group: {
          _id: "$ev.category",
          registrations: { $sum: 1 },
        },
      },
    ]);
    const catEvents = new Map(byCat.map((b) => [String(b._id), b.events]));
    const catRegs = new Map(regs.map((r) => [String(r._id), r.registrations]));

    const rows = cats.map((c) => ({
      category_id: c._id.toString(),
      name: c.name,
      events: catEvents.get(c._id.toString()) ?? 0,
      registrations: catRegs.get(c._id.toString()) ?? 0,
    }));
    rows.push({
      category_id: "-",
      name: "Uncategorized",
      events: catEvents.get("null") ?? 0,
      registrations: catRegs.get("null") ?? 0,
    });

    sendCsv(res, rows, "categories.csv");
  })
);

router.get(
  "/summary",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const [totalEvents, pending, approved, rejected, totalUsers, totalRegs] =
      await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ status: "pending" }),
        Event.countDocuments({ status: "approved" }),
        Event.countDocuments({ status: "rejected" }),
        Registration.db.models.User.countDocuments(),
        Registration.countDocuments(),
      ]);
    res.json({
      totalEvents,
      pending,
      approved,
      rejected,
      totalUsers,
      totalRegistrations: totalRegs,
    });
  })
);

export default router;
