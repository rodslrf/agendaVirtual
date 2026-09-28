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
    connectionLimit: 1,
    maxIdle: 0,
    idleTimeout: 1000,
    enableKeepAlive: false,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 20,
  }
}

function codigoConexao(erro: unknown): number {
  if (!erro || typeof erro !== "object") return 0
  if ("errno" in erro && Number(erro.errno) === 1203) return 1203
  if ("cause" in erro) return codigoConexao(erro.cause)
  return 0
}

function comNovaTentativa<T>(rodar: () => Promise<T>) {
  return (async () => {
    for (let tentativa = 0; tentativa < 12; tentativa++) {
      try {
        return await rodar()
      } catch (erro) {
        if (codigoConexao(erro) !== 1203 || tentativa === 11) throw erro
        await new Promise((resolver) => setTimeout(resolver, 500 * (tentativa + 1)))
      }
    }
    throw new Error("banco ocupado")
  })()
}

function colunaJaExiste(erro: unknown): boolean {
  if (!erro || typeof erro !== "object") return false
  if ("errno" in erro && Number(erro.errno) === 1060) return true
  if ("cause" in erro) return colunaJaExiste(erro.cause)
  return false
}

let colunasProntas: Promise<void> | undefined

function garantirColunas(consultar: mysql.Pool["query"]) {
  colunasProntas ??= (async () => {
    const comandos = [
      "ALTER TABLE `alert_settings` ADD `expediente_inicio` varchar(5) NOT NULL DEFAULT '08:00'",
      "ALTER TABLE `alert_settings` ADD `expediente_fim` varchar(5) NOT NULL DEFAULT '18:00'",
      "ALTER TABLE `compromissos` ADD `tarefa_origem_id` int",
    ]
    for (const sql of comandos) {
      try {
        await consultar(sql)
      } catch (erro) {
        if (!colunaJaExiste(erro)) throw erro
      }
    }
  })().catch((erro: unknown) => {
    colunasProntas = undefined
    throw erro
  })
  return colunasProntas
}

export function getPool() {
  // O datetime do Drizzle entra e sai em UTC. A tela mostra em America/Cuiaba.
  // O MySQL gratuito deixa uma conexão. Não segure ela entre consultas.
  if (!globalForDb.pool) {
    const pool = mysql.createPool(configDoBanco())
    const consultar = pool.query.bind(pool)
    const executar = pool.execute.bind(pool)
    pool.query = ((...argumentos: Parameters<typeof pool.query>) =>
      comNovaTentativa(async () => {
        await garantirColunas(consultar)
        return consultar(...argumentos)
      })) as typeof pool.query
    pool.execute = ((...argumentos: Parameters<typeof pool.execute>) =>
      comNovaTentativa(async () => {
        await garantirColunas(consultar)
        return executar(...argumentos)
      })) as typeof pool.execute
    globalForDb.pool = pool
  }
  return globalForDb.pool
}

export const db = drizzle(getPool(), { schema, mode: "default" })
