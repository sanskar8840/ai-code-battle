/**
 * Database seed script for coding problems.
 *
 * Usage:
 *   npm run seed            -> wipes the Problem collection and inserts all 30 seed problems
 *   npm run seed:destroy    -> (node seed/seed.js -d) wipes the Problem collection and exits, no reinsert
 *
 * Idempotent by design: every run starts by deleting all existing Problem
 * documents before inserting, so running this any number of times always
 * leaves exactly the 30 problems from problems.js — never duplicates.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Problem = require("../models/Problem");
const User = require("../models/User");
const PROBLEMS = require("./problems");

const isDestroyOnly = process.argv.includes("-d") || process.argv.includes("--destroy");

// A fixed, well-known seed admin account owns every seeded problem (the
// Problem schema requires `createdBy`). Created only if it doesn't already
// exist, so re-running the seed never duplicates it or resets its password.
const SEED_ADMIN = {
  name: "Seed Admin",
  username: "seed_admin",
  email: "Sanskaryadav578@gmail.com",
  password: "ChangeMe123!", // dev-only account; change or disable in production
  role: "admin",
};

const getOrCreateSeedAdmin = async () => {
  let admin = await User.findOne({ email: SEED_ADMIN.email });
  if (admin) return admin;

  admin = await User.create(SEED_ADMIN);
  console.log(`Created seed admin user (${SEED_ADMIN.email} / ${SEED_ADMIN.password}) — change this password before deploying.`);
  return admin;
};

const run = async () => {
  await connectDB();

  const deleted = await Problem.deleteMany({});
  console.log(`Cleared existing Problem collection (${deleted.deletedCount} removed).`);

  if (isDestroyOnly) {
    console.log("Destroy-only mode (-d): skipping insert.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = await getOrCreateSeedAdmin();

  const docs = PROBLEMS.map((p) => ({ ...p, createdBy: admin._id }));

  // Problem.create (not insertMany) so each document runs full schema
  // validation and the pre-validate slug-generation hook individually.
  for (let i = 0; i < docs.length; i++) {
  console.log(i + 1, docs[i].title);
}
  //const inserted = await Problem.create(docs);


for (let i = 0; i < docs.length; i++) {
  try {
    await Problem.create(docs[i]);
    console.log("Inserted:", docs[i].title);
  } catch (err) {
    console.log("FAILED:", docs[i].title);
    throw err;
  }
}


console.log("✅ Successfully inserted all problems.");



  // console.log(`Inserted ${inserted.length} problems.`);
  // const byDifficulty = inserted.reduce((acc, p) => {
  //   acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
  //   return acc;
  // }, {});
  // console.log("Difficulty breakdown:", byDifficulty);

  await mongoose.disconnect();
  console.log("Done — disconnected cleanly.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
