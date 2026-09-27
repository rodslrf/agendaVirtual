import { writeFileSync } from "node:fs"
import { loadEnvConfig } from "@next/env"
import { icone } from "../src/server/imagem"

loadEnvConfig(process.cwd())

async function main() {
  writeFileSync("public/icone-urgente.png", icone("urgente"))
  writeFileSync("public/icone-prazo.png", icone("prazo"))
  writeFileSync("public/icone-app.png", icone("app"))

  const { migrate } = await import("drizzle-orm/mysql2/migrator")
  const { db } = await import("../src/server/db")
  const { semear } = await import("../src/server/db/seed")
  await migrate(db, { migrationsFolder: "./drizzle" })
  await semear()
  console.log("banco pronto")
  process.exit(0)
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
