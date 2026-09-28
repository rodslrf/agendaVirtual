"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ptBR } from "date-fns/locale"
import { ChevronDownIcon } from "lucide-react"
import { modulos } from "@/config/modulos"
import { BotoesNovos } from "@/modules/agenda/botoes-novos"
import { chaveCalendario, chaveDia, dataDoCalendario, vistaValida } from "@/modules/agenda/tempo"
import type { TarefaView } from "@/modules/agenda/vistas"
import { cn } from "cn"

const CalendarioLateral = dynamic(
  () => import("@/components/ui/calendar").then((modulo) => modulo.Calendar),
  { ssr: false, loading: () => <div className="h-60 shrink-0 rounded-md bg-background" /> },
)

export function SidebarAgenda({
  aoNavegar,
  tarefas = [],
}: {
  aoNavegar?: () => void
  tarefas?: TarefaView[]
}) {
  const caminho = usePathname()
  const parametros = useSearchParams()
  const roteador = useRouter()
  const itens = modulos[0].itens
  const dataParametro = parametros.get("data")
  const dataAtual =
    dataParametro && /^\d{4}-\d{2}-\d{2}$/.test(dataParametro) ? dataParametro : chaveDia(new Date())
  const selecionado = dataDoCalendario(dataAtual)

  function irParaDia(destino: Date | undefined) {
    if (!destino) return
    const vistaAtual = parametros.get("vista")
    const vista = caminho.startsWith("/agenda") && vistaValida(vistaAtual ?? undefined) ? vistaAtual : "dia"
    roteador.push(`/agenda?vista=${vista}&data=${chaveCalendario(destino)}`)
    aoNavegar?.()
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-4 py-4">
      <BotoesNovos data={dataAtual} variante="lateral" />
      <CalendarioLateral
          mode="single"
          selected={selecionado}
          onSelect={irParaDia}
          locale={ptBR}
          className="w-fit max-w-full shrink-0 p-0"
        />
      <ListaTarefasLaterais tarefas={tarefas} />
      <nav className="flex flex-col gap-1" aria-label="Atalhos">
        <p className="px-2 text-xs font-medium text-muted-foreground">Meus atalhos</p>
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={aoNavegar}
            className={cn(
              "rounded-md px-2 py-2 text-sm font-medium",
              ativo(caminho, item.href)
                ? "bg-primary-selected text-foreground"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {item.nome}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function ListaTarefasLaterais({ tarefas }: { tarefas: TarefaView[] }) {
  const [aberto, setAberto] = useState(true)
  const ordenadas = [...tarefas].sort((a, b) => Number(Boolean(a.venceEm)) - Number(Boolean(b.venceEm)))
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground"
        onClick={() => setAberto((valor) => !valor)}
      >
        Tarefas
        <ChevronDownIcon className={cn("size-4 transition-transform", !aberto && "-rotate-90")} />
      </button>
      {aberto ? (
        ordenadas.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">Nada aberto para agendar.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {ordenadas.map((tarefa) => (
              <li key={tarefa.id}>
                <p
                  draggable
                  onDragStart={(evento) => {
                    evento.dataTransfer.setData("application/x-agenda-tarefa", String(tarefa.id))
                    evento.dataTransfer.setData("text/plain", `tarefa:${tarefa.id}`)
                    evento.dataTransfer.effectAllowed = "copy"
                  }}
                  className="cursor-grab rounded-md bg-background px-2 py-1.5 text-sm ring-1 ring-border active:cursor-grabbing"
                >
                  {tarefa.titulo}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  )
}

function ativo(caminho: string, href: string) {
  if (href === "/") return caminho === "/"
  return caminho === href || caminho.startsWith(`${href}?`) || caminho.startsWith(`${href}/`)
}
