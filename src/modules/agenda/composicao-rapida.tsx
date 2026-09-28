"use client"

import { useEffect, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { salvarCompromisso } from "@/modules/agenda/acoes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { horarioDoMinuto } from "@/modules/agenda/grade"

export function ComposicaoRapida({
  data,
  inicioMin,
  duracaoMinutos,
  x,
  y,
  aoFechar,
  aoMaisOpcoes,
}: {
  data: string
  inicioMin: number
  duracaoMinutos: number
  x: number
  y: number
  aoFechar: () => void
  aoMaisOpcoes: () => void
}) {
  const [titulo, setTitulo] = useState("")
  const [pendente, iniciar] = useTransition()
  const [podeFechar, setPodeFechar] = useState(false)
  const [noCliente, setNoCliente] = useState(false)
  const hora = horarioDoMinuto(inicioMin).texto
  const esquerda = Math.min(Math.max(8, x), (typeof window === "undefined" ? 800 : window.innerWidth) - 288)
  const topo = Math.min(Math.max(8, y), (typeof window === "undefined" ? 600 : window.innerHeight) - 160)

  useEffect(() => {
    setNoCliente(true)
    const id = window.setTimeout(() => setPodeFechar(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar()
    }
    window.addEventListener("keydown", tecla)
    return () => window.removeEventListener("keydown", tecla)
  }, [aoFechar])

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarCompromisso({
        titulo,
        notas: "",
        data,
        hora,
        duracaoValor: duracaoMinutos,
        duracaoUnidade: "minuto",
        repeticao: "nenhuma",
        repeteAte: "",
      })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      aoFechar()
    })
  }

  if (!noCliente) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80]"
      onClick={() => {
        if (podeFechar) aoFechar()
      }}
    >
      <div
        role="dialog"
        aria-label="Novo horário"
        className="absolute flex w-72 flex-col gap-2 rounded-lg bg-popover p-2.5 text-sm shadow-[var(--shadow-popover)] ring-1 ring-border"
        style={{ left: esquerda, top: topo }}
        onClick={(evento) => evento.stopPropagation()}
      >
        <p className="text-xs text-muted-foreground">
          {hora} · {duracaoMinutos} min
        </p>
        <Input
          autoFocus
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          placeholder="Quem ou o quê"
          className="min-h-10"
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault()
              salvar()
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={aoMaisOpcoes}>
            Mais opções
          </Button>
          <Button type="button" size="sm" disabled={pendente} onClick={salvar}>
            Salvar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
