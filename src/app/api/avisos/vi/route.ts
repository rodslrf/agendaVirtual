import { NextResponse } from "next/server"
import { acusarAviso } from "@/modules/agenda/consultas"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null)
  if (!corpo || (corpo.alvoTipo !== "tarefa" && corpo.alvoTipo !== "compromisso")) {
    return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  }
  if (corpo.tipo !== "urgente" && corpo.tipo !== "prazo") {
    return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  }
  const alvoId = Number(corpo.alvoId)
  if (!Number.isInteger(alvoId)) return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  await acusarAviso(corpo.alvoTipo, alvoId, corpo.tipo)
  return NextResponse.json({ ok: true })
}
