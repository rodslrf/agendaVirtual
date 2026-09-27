import { NextResponse } from "next/server"

export function GET() {
  const chave = process.env.VAPID_PUBLIC_KEY
  if (!chave) return NextResponse.json({ erro: "Chave pública ausente" }, { status: 503 })
  return NextResponse.json({ chave })
}
