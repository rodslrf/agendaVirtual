"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { AvisoVisivel } from "@/modules/agenda/vistas"

export function PainelAviso() {
  const [avisos, setAvisos] = useState<AvisoVisivel[]>([])
  const [som, setSom] = useState(false)
  const vistos = useRef(new Set<string>())
  const roteador = useRouter()

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const resposta = await fetch("/api/avisos/pendentes")
      if (!resposta.ok || !ativo) return
      const corpo = (await resposta.json()) as { som: boolean; avisos: AvisoVisivel[] }
      if (!ativo) return
      setSom(corpo.som)
      setAvisos(corpo.avisos)
    }
    carregar()
    const relogio = window.setInterval(carregar, 20_000)
    window.addEventListener("focus", carregar)
    return () => {
      ativo = false
      window.clearInterval(relogio)
      window.removeEventListener("focus", carregar)
    }
  }, [])

  const primeiro = avisos[0]
  const chave = primeiro ? `${primeiro.alvoTipo}-${primeiro.alvoId}-${primeiro.tipo}` : ""

  useEffect(() => {
    if (!primeiro) return
    if (!chave || vistos.current.has(chave)) return
    vistos.current.add(chave)
    if (som) tocar()
    void fetch("/api/push/agora", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tipo: primeiro.tipo,
        alvoTipo: primeiro.alvoTipo,
        alvoId: primeiro.alvoId,
        titulo: primeiro.titulo,
        data: primeiro.data,
        hora: primeiro.hora,
      }),
    })
  }, [chave, primeiro, som])

  if (!primeiro) return null

  const caminho =
    primeiro.alvoTipo === "tarefa" ? "/lista" : "/agenda?vista=dia"

  async function acusar(acao: "vi" | "adiar", minutos?: number) {
    await fetch(acao === "vi" ? "/api/avisos/vi" : "/api/avisos/adiar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        alvoTipo: primeiro.alvoTipo,
        alvoId: primeiro.alvoId,
        tipo: primeiro.tipo,
        minutos,
      }),
    })
    setAvisos((atual) => atual.filter((aviso) => aviso !== primeiro))
    roteador.refresh()
  }

  const urgente = primeiro.tipo === "urgente"

  return (
    <section
        role="alertdialog"
        aria-labelledby="aviso-titulo"
        aria-describedby="aviso-quando"
        className={`fixed inset-x-3 bottom-16 z-50 flex flex-col gap-2 rounded-lg px-3 py-2.5 text-white shadow-[var(--shadow-popover)] lg:bottom-3 lg:flex-row lg:items-center lg:gap-4 ${
          urgente ? "bg-destructive" : "bg-aviso"
        }`}
      >
        <div className="min-w-0 lg:flex-1">
          <p className="text-xs font-medium">
            {urgente ? "Urgente" : "O prazo está chegando"}
            {avisos.length > 1 ? ` · mais ${avisos.length - 1}` : ""}
          </p>
          <h2 id="aviso-titulo" className="truncate text-base font-semibold">
            {primeiro.titulo}
          </h2>
        </div>
        <p id="aviso-quando" className="shrink-0 text-xl font-semibold tabular-nums">
          {primeiro.data} · {primeiro.hora}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href={caminho} />} nativeButton={false} variant="secondary" size="sm" className="min-h-10">
            Abrir
          </Button>
          <Button type="button" variant="secondary" size="sm" className="min-h-10" onClick={() => acusar("vi")}>
            Já vi
          </Button>
          <Button type="button" variant="secondary" size="sm" className="min-h-10" onClick={() => acusar("adiar", 15)}>
            Adiar 15 min
          </Button>
          <Button type="button" variant="secondary" size="sm" className="min-h-10" onClick={() => acusar("adiar", 60)}>
            Adiar 1 h
          </Button>
        </div>
      </section>
  )
}

function tocar() {
  const contexto = new AudioContext()
  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()
  oscilador.frequency.value = 880
  ganho.gain.value = 0.04
  oscilador.connect(ganho)
  ganho.connect(contexto.destination)
  oscilador.start()
  ganho.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.35)
  oscilador.stop(contexto.currentTime + 0.35)
}
