import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const run = async () => {
  console.log("Running schema.sql against the database...");
  await db.query(sql);
  console.log("Schema applied.");
  await db.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
