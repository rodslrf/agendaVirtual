import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const url = `${process.env.APP_URL ?? "http://127.0.0.1:3000"}/api/avisos/tick`
const segredo = process.env.CRON_SECRET

async function ciclo() {
  if (!segredo) throw new Error("CRON_SECRET não definida")
  for (;;) {
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { authorization: `Bearer ${segredo}` },
      })
      console.log(new Date().toISOString(), resposta.status)
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "sem conexão"
      console.log("aguardando o site", mensagem)
    }
    await new Promise((resolver) => setTimeout(resolver, 30_000))
  }
}

ciclo()
