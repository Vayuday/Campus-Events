/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Runs a local MongoDB (mongod) on port 27017 with on-disk persistence at
 * `<repo-root>/.mongo-data`. No Docker required — mongodb-memory-server
 * downloads the mongod binary once into ~/.cache/mongodb-binaries and reuses
 * it thereafter.
 *
 * Keep this process running in its own terminal. Ctrl-C to stop.
 */
async function main() {
  const dbPath = path.resolve(__dirname, "../../../.mongo-data");
  fs.mkdirSync(dbPath, { recursive: true });

  console.log("[dev-db] starting local mongod (first run downloads ~100 MB)…");

  const server = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "campus_events",
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  const uri = server.getUri();
  console.log(`[dev-db] ready: ${uri}`);
  console.log(`[dev-db] data directory: ${dbPath}`);
  console.log("[dev-db] press Ctrl-C to stop\n");

  async function shutdown(signal: string) {
    console.log(`\n[dev-db] ${signal} received, stopping…`);
    await server.stop();
    process.exit(0);
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[dev-db] failed to start:", err);
  process.exit(1);
});
