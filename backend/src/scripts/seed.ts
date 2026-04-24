/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { Notification } from "../models/Notification";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function run() {
  await connectDb();

  console.log("[seed] clearing collections...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log("[seed] creating users...");
  const admin = await User.create({
    name: "Admin",
    email: "admin@campus.edu",
    passwordHash: await hash("Admin@123"),
    role: "admin",
  });
  await User.create({
    name: "Priya Organizer",
    email: "organizer@campus.edu",
    passwordHash: await hash("Organizer@123"),
    role: "organizer",
  });
  await User.create({
    name: "Rahul Organizer",
    email: "organizer2@campus.edu",
    passwordHash: await hash("Organizer@123"),
    role: "organizer",
  });
  await Promise.all(
    [
      { name: "Aarav Student", email: "aarav@campus.edu" },
      { name: "Meera Student", email: "meera@campus.edu" },
      { name: "Kiran Student", email: "kiran@campus.edu" },
    ].map(async (s) =>
      User.create({
        ...s,
        passwordHash: await hash("Student@123"),
        role: "student",
      })
    )
  );

  console.log("[seed] creating categories...");
  await Promise.all([
    Category.create({ name: "Technical", slug: "technical", createdBy: admin._id }),
    Category.create({ name: "Cultural", slug: "cultural", createdBy: admin._id }),
  ]);

  console.log(
    "[seed] no demo events created — organizers will create them through the dashboard."
  );

  console.log("\nDemo credentials:");
  console.log("  Admin:      admin@campus.edu      / Admin@123");
  console.log("  Organizer:  organizer@campus.edu  / Organizer@123");
  console.log("  Organizer:  organizer2@campus.edu / Organizer@123");
  console.log("  Student:    aarav@campus.edu      / Student@123");
  console.log("  Student:    meera@campus.edu      / Student@123");
  console.log("  Student:    kiran@campus.edu      / Student@123");

  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
