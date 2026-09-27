import { NextResponse } from "next/server"
import { adiarAlvo } from "@/modules/agenda/consultas"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null)
  const minutos = Number(corpo?.minutos)
  if (!corpo || (minutos !== 15 && minutos !== 60)) {
    return NextResponse.json({ erro: "Adiamento inválido" }, { status: 400 })
  }
  if (corpo.alvoTipo !== "tarefa" && corpo.alvoTipo !== "compromisso") {
    return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  }
  const alvoId = Number(corpo.alvoId)
  if (!Number.isInteger(alvoId)) return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  await adiarAlvo(corpo.alvoTipo, alvoId, minutos)
  return NextResponse.json({ ok: true })
}
