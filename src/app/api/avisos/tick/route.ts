import { NextResponse } from "next/server"
import { avaliar } from "@/server/alerts/avaliar"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const segredo = process.env.CRON_SECRET
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }
  try {
    const enviados = await avaliar()
    return NextResponse.json({ enviados })
  } catch (erro) {
    console.error(erro)
    return NextResponse.json({ erro: "Falha ao avaliar avisos" }, { status: 500 })
  }
}
