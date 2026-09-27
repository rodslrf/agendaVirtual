import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { pool?: mysql.Pool }

function configDoBanco() {
  const bruta = process.env.DATABASE_URL
  if (!bruta) throw new Error("DATABASE_URL não definida")
  const url = new URL(bruta)
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 10,
  }
}

export function getPool() {
  // O datetime do Drizzle entra e sai em UTC. A tela mostra em America/Cuiaba.
  if (!globalForDb.pool) globalForDb.pool = mysql.createPool(configDoBanco())
  return globalForDb.pool
}

export const db = drizzle(getPool(), { schema, mode: "default" })
