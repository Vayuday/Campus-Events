import { Router } from "express";
import { Category } from "../models/Category";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { categorySchema } from "../validators/schemas";

const router = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const list = await Category.find().sort({ name: 1 });
    res.json({ categories: list.map((c) => c.toJSON()) });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { name } = categorySchema.parse(req.body);
    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) throw new HttpError(409, "Category already exists");

    const cat = await Category.create({
      name,
      slug,
      createdBy: req.user!.sub,
    });
    res.status(201).json({ category: cat.toJSON() });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { name } = categorySchema.parse(req.body);
    const slug = slugify(name);
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true }
    );
    if (!cat) throw new HttpError(404, "Category not found");
    res.json({ category: cat.toJSON() });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) throw new HttpError(404, "Category not found");
    res.json({ ok: true });
  })
);

export default router;
