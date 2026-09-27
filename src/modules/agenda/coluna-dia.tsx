"use client"

import { useState } from "react"
import { chaveDia, horaCurta, partesCuiaba, textoQuando } from "@/modules/agenda/tempo"
import { textoDuracao } from "@/modules/agenda/duracao"
import type { CompromissoView, TarefaView } from "@/modules/agenda/vistas"
import { FormularioCompromisso } from "@/modules/agenda/formulario-compromisso"

const ALTURA = 52
const ORDEM = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

export function ColunaDia({
  compromissos,
  tarefas,
  data,
}: {
  compromissos: CompromissoView[]
  tarefas: TarefaView[]
  data: string
}) {
  const horas = ORDEM
  const dentro = compromissos
  const marcadores = tarefas.filter((tarefa) => tarefa.venceEm && mesmoDia(tarefa.venceEm, data))
  const { coluna, colunas } = encaixar(dentro)
  const [novaHora, setNovaHora] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full" style={{ height: horas.length * ALTURA }}>
        {horas.map((hora, indice) => (
          <div
            key={hora}
            className="absolute inset-x-0 cursor-pointer border-t border-border"
            style={{ top: indice * ALTURA, height: ALTURA }}
            onClick={() => setNovaHora(`${String(hora).padStart(2, "0")}:00`)}
          >
            <span className="absolute top-1 left-0 text-xs text-muted-foreground">
              {String(hora).padStart(2, "0")}h
            </span>
          </div>
        ))}
        {dentro.map((item) => (
          <div
            key={`${item.id}-${item.comecaEm}`}
            className="absolute min-w-0"
            style={{
              top: topo(item.comecaEm),
              height: Math.max(58, (item.duracaoMinutos / 60) * ALTURA),
              left: `calc(3rem + ((100% - 3rem) * ${coluna.get(item.id)!} + 4px) / ${colunas})`,
              width: `calc((100% - 3rem - ${(colunas - 1) * 4}px) / ${colunas})`,
            }}
          >
            <BlocoHorario compromisso={item} />
          </div>
        ))}
        {marcadores.map((tarefa) => (
          <p
            key={tarefa.id}
            className="absolute right-0 left-12 truncate border-l-2 border-primary bg-secondary px-2 py-1 text-sm"
            style={{ top: topo(tarefa.venceEm!) }}
          >
            {horaCurta(new Date(tarefa.venceEm!))} {tarefa.titulo}
          </p>
        ))}
      </div>
      {novaHora ? (
        <FormularioCompromisso
          aberto
          aoFechar={() => setNovaHora(null)}
          dataInicial={data}
          horaInicial={novaHora}
        />
      ) : null}
    </div>
  )
}

function BlocoHorario({ compromisso }: { compromisso: CompromissoView }) {
  const [aberto, setAberto] = useState(false)
  const inicio = new Date(compromisso.comecaEm)
  return (
    <div
      className={`flex h-full flex-col justify-between rounded-lg px-3 py-2 ${
        compromisso.status === "feito" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
      }`}
    >
      <button
        type="button"
        className="flex h-full w-full flex-col text-left"
        onClick={(evento) => {
          evento.stopPropagation()
          setAberto(true)
        }}
      >
        <span className="flex items-center gap-1 text-xs">
          {horaCurta(inicio)} · {textoDuracao(compromisso.duracaoValor, compromisso.duracaoUnidade)}
          {compromisso.conflito ? (
            <span className="rounded bg-white/25 px-1 text-[10px] leading-4">Conflito</span>
          ) : null}
        </span>
        <span className="line-clamp-2 text-sm leading-snug">{compromisso.titulo}</span>
      </button>
      {aberto ? (
        <FormularioCompromisso aberto aoFechar={setAberto} compromisso={compromisso} />
      ) : null}
      <span className="sr-only">{textoQuando(compromisso.comecaEm)}</span>
    </div>
  )
}

function mesmoDia(iso: string, chave: string) {
  return chaveDia(new Date(iso)) === chave
}

function indiceVisual(hora: number) {
  const indice = ORDEM.indexOf(hora)
  return indice < 0 ? 0 : indice
}

function topo(iso: string) {
  const parte = partesCuiaba(new Date(iso))
  return (indiceVisual(parte.hora) + parte.minuto / 60) * ALTURA
}

function encaixar(itens: CompromissoView[]) {
  const ordenados = [...itens].sort(
    (a, b) => new Date(a.comecaEm).getTime() - new Date(b.comecaEm).getTime(),
  )
  const ocupadas: number[] = []
  const coluna = new Map<number, number>()
  for (const item of ordenados) {
    const inicio = new Date(item.comecaEm).getTime()
    const fim = inicio + item.duracaoMinutos * 60_000
    let indice = ocupadas.findIndex((limite) => limite <= inicio)
    if (indice === -1) {
      indice = ocupadas.length
      ocupadas.push(fim)
    } else {
      ocupadas[indice] = fim
    }
    coluna.set(item.id, indice)
  }
  return { coluna, colunas: Math.max(1, ocupadas.length) }
}
