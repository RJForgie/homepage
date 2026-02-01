import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { join } from "path";
import type { DB } from "./types";

const DB_PATH = join(process.cwd(), "data", "prod.db");

let db: Kysely<DB> | null = null;

export function getDb(): Kysely<DB> {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new SqliteDialect({
        database: new Database(DB_PATH, { readonly: true }),
      }),
    });
  }
  return db;
}
