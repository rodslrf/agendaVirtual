import { NextResponse } from "next/server"
import { faixa } from "@/server/imagem"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const tipo = url.searchParams.get("tipo") === "urgente" ? "urgente" : "prazo"
  const hora = url.searchParams.get("hora") ?? ""
  const imagem = faixa(tipo, hora)
  return new NextResponse(new Uint8Array(imagem), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=300",
    },
  })
}
