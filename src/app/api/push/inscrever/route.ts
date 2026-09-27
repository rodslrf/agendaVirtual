import { NextResponse } from "next/server"
import { gravarInscricao } from "@/modules/agenda/consultas"
import { enviarPush, pushDeTeste } from "@/server/push/enviar"

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null)
  const endpoint = corpo?.endpoint
  const p256dh = corpo?.keys?.p256dh
  const auth = corpo?.keys?.auth
  if (typeof endpoint !== "string" || endpoint.length > 760 || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ erro: "Inscrição inválida" }, { status: 400 })
  }
  await gravarInscricao({ endpoint, p256dh, auth })
  const push = await enviarPush(pushDeTeste())
  return NextResponse.json({ ok: true, push })
}
