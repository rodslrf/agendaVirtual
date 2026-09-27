import { NextResponse } from "next/server"
import { listarAvisosVisiveis } from "@/modules/agenda/consultas"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const painel = await listarAvisosVisiveis()
    return NextResponse.json(painel)
  } catch (erro) {
    console.error(erro)
    return NextResponse.json({ som: false, avisos: [] })
  }
}
