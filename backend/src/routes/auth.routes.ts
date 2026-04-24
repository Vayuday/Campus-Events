import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { requireAuth, signToken } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { registerSchema, loginSchema } from "../validators/schemas";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) throw new HttpError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role ?? "student",
    });

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.status(201).json({ token, user: user.toJSON() });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.json({ token, user: user.toJSON() });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.sub);
    if (!user) throw new HttpError(404, "User not found");
    res.json({ user: user.toJSON() });
  })
);

export default router;
