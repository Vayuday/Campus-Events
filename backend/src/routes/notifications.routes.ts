import { Router } from "express";
import { Notification } from "../models/Notification";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const list = await Notification.find({ user: req.user!.sub })
      .sort({ createdAt: -1 })
      .limit(100);
    const unread = await Notification.countDocuments({
      user: req.user!.sub,
      readAt: null,
    });
    res.json({
      notifications: list.map((n) => n.toJSON()),
      unread,
    });
  })
);

router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.sub },
      { readAt: new Date() },
      { new: true }
    );
    if (!notif) throw new HttpError(404, "Notification not found");
    res.json({ notification: notif.toJSON() });
  })
);

router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { user: req.user!.sub, readAt: null },
      { readAt: new Date() }
    );
    res.json({ ok: true });
  })
);

export default router;
