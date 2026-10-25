import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __tambreSql: ReturnType<typeof postgres> | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL manquant. Copiez .env.example vers .env.local et renseignez l'URL PostgreSQL (voir README). Sur Vercel : Settings › Environment Variables."
    );
  }

  // Un seul pool par processus (évite l'épuisement des connexions en développement et en serverless).
  const sql =
    globalThis.__tambreSql ??
    postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      prepare: process.env.DATABASE_PREPARE !== "false", // false pour les poolers en mode transaction
      idle_timeout: 20,
    });
  if (process.env.NODE_ENV !== "production") globalThis.__tambreSql = sql;

  return drizzle(sql, { schema });
}

type Db = ReturnType<typeof connect>;
let instance: Db | undefined;

// Connexion ouverte au premier usage : importer ce module (collecte de configuration des routes
// pendant `next build`) ne lève plus d'erreur quand DATABASE_URL est absent.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    instance ??= connect();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
export { schema };
