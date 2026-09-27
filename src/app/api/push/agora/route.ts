import { NextResponse } from "next/server"
import { enviarPush, type AvisoPush } from "@/server/push/enviar"

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null)
  const tipo = corpo?.tipo === "urgente" ? "urgente" : corpo?.tipo === "prazo" ? "prazo" : null
  const alvoTipo = corpo?.alvoTipo === "tarefa" || corpo?.alvoTipo === "compromisso" ? corpo.alvoTipo : null
  const alvoId = Number(corpo?.alvoId)
  const titulo = typeof corpo?.titulo === "string" ? corpo.titulo.slice(0, 200) : ""
  const data = typeof corpo?.data === "string" ? corpo.data.slice(0, 20) : ""
  const hora = typeof corpo?.hora === "string" ? corpo.hora.slice(0, 8) : ""
  if (!tipo || !alvoTipo || !Number.isInteger(alvoId) || alvoId < 1 || !titulo) {
    return NextResponse.json({ erro: "Aviso inválido" }, { status: 400 })
  }
  const aviso: AvisoPush = {
    titulo,
    corpo: `${titulo} · ${data} ${hora}`.trim(),
    tipo,
    tag: `${alvoTipo}-${alvoId}-${tipo}`,
    url: alvoTipo === "tarefa" ? "/lista" : "/agenda?vista=dia",
    alvoTipo,
    alvoId,
    hora,
  }
  const push = await enviarPush(aviso)
  return NextResponse.json({ ok: true, push })
}
