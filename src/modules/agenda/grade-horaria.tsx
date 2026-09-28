"use client"

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { cn } from "cn"
import { chaveDia, diaDaChave, horaCurta, partesCuiaba, textoQuando } from "@/modules/agenda/tempo"
import { textoDuracao } from "@/modules/agenda/duracao"
import type { CompromissoView, TarefaView } from "@/modules/agenda/vistas"
import { FormularioCompromisso } from "@/modules/agenda/formulario-compromisso"
import { FormularioTarefa } from "@/modules/agenda/formulario-tarefa"
import { ComposicaoRapida } from "@/modules/agenda/composicao-rapida"
import { charmDoTitulo } from "@/modules/agenda/charms"
import { bloquearTarefa, moverCompromisso } from "@/modules/agenda/acoes"
import {
  ALTURA_HORA,
  DURACAO_CLIQUE_MINUTOS,
  LIMIAR_ARRASTE_PX,
  ORDEM_HORAS,
  SNAP_MINUTOS,
  duracaoDaFaixa,
  encaixarMinutos,
  horaForaDoExpediente,
  horarioDoMinuto,
  minutosDoHorario,
  minutosNoPonto,
} from "@/modules/agenda/grade"

export { ORDEM_HORAS, ALTURA_HORA }

const COLUNA_HORA = "w-[var(--calendar-time-column-width)] shrink-0"

type Gesto =
  | {
      tipo: "criar"
      dia: string
      origemMin: number
      atualMin: number
      x: number
      y: number
      toque: boolean
    }
  | {
      tipo: "mover"
      id: number
      dia: string
      inicioMin: number
      duracao: number
      offsetMin: number
      origemDia: string
      origemInicio: number
      arrastou: boolean
      x: number
      y: number
      largura: number
      offsetX: number
      offsetY: number
    }
  | {
      tipo: "redimensionar"
      id: number
      borda: "inicio" | "fim"
      dia: string
      inicioMin: number
      duracao: number
      origemInicio: number
      origemDuracao: number
      x: number
      y: number
    }

type Pouso = { id: number; dia: string; inicioMin: number; duracao: number }

type Composicao = {
  data: string
  inicioMin: number
  duracaoMinutos: number
  x: number
  y: number
}

export function GradeHoraria({
  dias,
  compromissos,
  tarefas = [],
  ancora,
  preencher = false,
  expedienteInicio = "08:00",
  expedienteFim = "18:00",
}: {
  dias: string[]
  compromissos: CompromissoView[]
  tarefas?: TarefaView[]
  ancora: string
  preencher?: boolean
  expedienteInicio?: string
  expedienteFim?: string
}) {
  const quantidade = useQuantidadeColunas(dias.length)
  const visiveis = fatiarDias(dias, ancora, quantidade)
  const visiveisChave = visiveis.join(",")
  const hoje = chaveDia(new Date())
  const [novo, setNovo] = useState<{ data: string; hora: string; duracaoMinutos: number } | null>(null)
  const [composicao, setComposicao] = useState<Composicao | null>(null)
  const [gesto, setGesto] = useState<Gesto | null>(null)
  const [pouso, setPouso] = useState<Pouso | null>(null)
  const rolagem = useRef<HTMLDivElement>(null)
  const grade = useRef<HTMLDivElement>(null)
  const gestoRef = useRef<Gesto | null>(null)
  const pulouClique = useRef(false)

  function aplicarGesto(proximo: Gesto | null) {
    gestoRef.current = proximo
    setGesto(proximo)
  }

  function comecarGesto(inicial: Gesto) {
    aplicarGesto(inicial)
    function mover(evento: PointerEvent) {
      aplicarGesto(atualizarGesto(gestoRef.current, evento, grade.current))
    }
    function soltar(evento: PointerEvent) {
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
      const atual = gestoRef.current
      aplicarGesto(null)
      if (!atual) return
      if (atual.tipo === "criar") {
        const faixa = duracaoDaFaixa(atual.origemMin, atual.atualMin)
        const clicou = Math.abs(atual.atualMin - atual.origemMin) < SNAP_MINUTOS
        if (clicou) return
        pulouClique.current = true
        setComposicao({
          data: atual.dia,
          inicioMin: faixa.inicio,
          duracaoMinutos: faixa.duracao,
          x: evento.clientX,
          y: evento.clientY,
        })
        return
      }
      if (atual.tipo === "mover" && !atual.arrastou) return
      if (atual.tipo === "mover" || atual.tipo === "redimensionar") {
        const igual =
          atual.tipo === "mover"
            ? atual.dia === atual.origemDia && atual.inicioMin === atual.origemInicio
            : atual.inicioMin === atual.origemInicio && atual.duracao === atual.origemDuracao
        if (igual) return
        setPouso({ id: atual.id, dia: atual.dia, inicioMin: atual.inicioMin, duracao: atual.duracao })
        const hora = horarioDoMinuto(atual.inicioMin).texto
        void moverCompromisso({
          id: atual.id,
          data: atual.dia,
          hora,
          duracaoMinutos: atual.duracao,
        }).then((resultado) => {
          if (resultado.erro) {
            toast.error(resultado.erro)
            setPouso(null)
          }
        })
      }
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }

  useEffect(() => {
    const caixa = rolagem.current
    if (!caixa || !preencher) return
    const parte = partesCuiaba(new Date())
    const horasVisiveis = visiveisChave.split(",")
    const alvo = horasVisiveis.includes(hoje) && ORDEM_HORAS.includes(parte.hora) ? parte.hora : 8
    const indice = ORDEM_HORAS.indexOf(alvo)
    if (indice < 0) return
    caixa.scrollTop = Math.max(0, indice * ALTURA_HORA - 24)
  }, [preencher, visiveisChave, hoje])

  useEffect(() => {
    if (!gesto) return
    function tecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") aplicarGesto(null)
    }
    window.addEventListener("keydown", tecla)
    return () => window.removeEventListener("keydown", tecla)
  }, [gesto])

  useEffect(() => {
    if (!gesto || (gesto.tipo !== "mover" && gesto.tipo !== "redimensionar")) return
    const anterior = document.body.style.cursor
    document.body.style.cursor = gesto.tipo === "mover" ? "grabbing" : "ns-resize"
    return () => {
      document.body.style.cursor = anterior
    }
  }, [gesto])

  useEffect(() => {
    if (!pouso) return
    const item = compromissos.find((entrada) => entrada.id === pouso.id)
    if (!item) return
    const parte = partesCuiaba(new Date(item.comecaEm))
    const inicio = minutosDoHorario(parte.hora, parte.minuto)
    if (
      chaveDia(new Date(item.comecaEm)) === pouso.dia &&
      inicio === pouso.inicioMin &&
      item.duracaoMinutos === pouso.duracao
    ) {
      setPouso(null)
    }
  }, [compromissos, pouso])

  const altura = ORDEM_HORAS.length * ALTURA_HORA
  const ligados = new Set(
    compromissos.map((item) => item.tarefaOrigemId).filter((id): id is number => id != null),
  )

  const unico = visiveis.length === 1

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        preencher && "flex-1",
        !preencher && "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
      )}
    >
      <div className="agenda-gutter flex shrink-0 overflow-y-auto border-b border-border">
        <div className={COLUNA_HORA} />
        {visiveis.map((chave) => (
          <CabecalhoDia key={chave} chave={chave} hoje={hoje} selecionado={ancora} unico={unico} />
        ))}
      </div>
      <FaixaDiaInteiro dias={visiveis} compromissos={compromissos} />
      <div
        ref={rolagem}
        className={cn(
          "agenda-scroll agenda-gutter min-h-0 overflow-x-hidden overflow-y-auto",
          preencher ? "flex-1" : "max-h-[min(36rem,70vh)]",
        )}
      >
        <div ref={grade} className="flex pt-3" style={{ height: altura + 12 }}>
          <div className={cn("relative", COLUNA_HORA)}>
            {ORDEM_HORAS.map((hora, indice) => (
              <span
                key={hora}
                className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums"
                style={{ top: indice * ALTURA_HORA }}
              >
                {String(hora).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          {visiveis.map((chave) => (
            <ColunaHoraria
              key={chave}
              dia={chave}
              ehHoje={chave === hoje}
              compromissos={compromissosDaColuna(chave, compromissos, gesto, pouso)}
              tarefas={tarefas.filter(
                (tarefa) =>
                  !ligados.has(tarefa.id) &&
                  tarefa.venceEm &&
                  chaveDia(new Date(tarefa.venceEm)) === chave,
              )}
              gesto={gesto}
              pouso={pouso}
              expedienteInicio={expedienteInicio}
              expedienteFim={expedienteFim}
              aoCriar={(evento) => iniciarCriacao(evento, chave, comecarGesto)}
              aoCliqueVazio={(x, y, inicioMin) => {
                if (pulouClique.current) {
                  pulouClique.current = false
                  return
                }
                setComposicao({
                  data: chave,
                  inicioMin,
                  duracaoMinutos: DURACAO_CLIQUE_MINUTOS,
                  x,
                  y,
                })
              }}
              aoMover={comecarGesto}
            />
          ))}
        </div>
      </div>
      {composicao ? (
        <ComposicaoRapida
          data={composicao.data}
          inicioMin={composicao.inicioMin}
          duracaoMinutos={composicao.duracaoMinutos}
          x={composicao.x}
          y={composicao.y}
          aoFechar={() => setComposicao(null)}
          aoMaisOpcoes={() => {
            setNovo({
              data: composicao.data,
              hora: horarioDoMinuto(composicao.inicioMin).texto,
              duracaoMinutos: composicao.duracaoMinutos,
            })
            setComposicao(null)
          }}
        />
      ) : null}
      {novo ? (
        <FormularioCompromisso
          aberto
          aoFechar={() => setNovo(null)}
          dataInicial={novo.data}
          horaInicial={novo.hora}
          duracaoInicial={novo.duracaoMinutos}
        />
      ) : null}
      {gesto?.tipo === "mover" && gesto.arrastou
        ? createPortal(
            <CloneArraste gesto={gesto} compromisso={compromissos.find((item) => item.id === gesto.id)} />,
            document.body,
          )
        : null}
      {gesto?.tipo === "redimensionar"
        ? createPortal(<BadgeDuracao gesto={gesto} />, document.body)
        : null}
    </div>
  )
}

function iniciarCriacao(
  evento: React.PointerEvent<HTMLElement>,
  dia: string,
  setGesto: (gesto: Gesto) => void,
) {
  if (evento.button !== 0) return
  const coluna = evento.currentTarget.closest("[data-dia]")
  const retangulo = coluna?.getBoundingClientRect()
  if (!retangulo) return
  const minutos = minutosNoPonto(evento.clientY, retangulo.top)
  setGesto({
    tipo: "criar",
    dia,
    origemMin: minutos,
    atualMin: minutos,
    x: evento.clientX,
    y: evento.clientY,
    toque: evento.pointerType === "touch",
  })
}

function distancia(a: number, b: number) {
  return Math.abs(a - b)
}

function colunaNoPonto(x: number, y: number, raiz: HTMLDivElement | null) {
  const alvo = document.elementFromPoint(x, y)
  const coluna = alvo instanceof Element ? alvo.closest("[data-dia]") : null
  if (coluna instanceof HTMLElement && raiz?.contains(coluna)) return coluna
  return null
}

function atualizarGesto(atual: Gesto | null, evento: PointerEvent, raiz: HTMLDivElement | null): Gesto | null {
  if (!atual) return null
  const coluna = colunaNoPonto(evento.clientX, evento.clientY, raiz)
  const retangulo = coluna?.getBoundingClientRect()
  const minutos = retangulo ? minutosNoPonto(evento.clientY, retangulo.top) : null
  if (atual.tipo === "criar") {
    return {
      ...atual,
      atualMin: minutos ?? atual.atualMin,
      x: evento.clientX,
      y: evento.clientY,
    }
  }
  if (atual.tipo === "mover") {
    const seguindo = { ...atual, x: evento.clientX, y: evento.clientY }
    if (minutos == null) return seguindo
    const limite = ORDEM_HORAS.length * 60 - atual.duracao
    const inicio = Math.max(0, Math.min(encaixarMinutos(minutos - atual.offsetMin), limite))
    const dia = coluna?.dataset.dia ?? atual.dia
    const arrastou = atual.arrastou || dia !== atual.origemDia || inicio !== atual.origemInicio
    return { ...seguindo, dia, inicioMin: inicio, arrastou }
  }
  if (atual.tipo === "redimensionar") {
    const seguindo = { ...atual, x: evento.clientX, y: evento.clientY }
    if (minutos == null) return seguindo
    if (atual.borda === "inicio") {
      const fim = atual.origemInicio + atual.origemDuracao
      const inicio = Math.min(minutos, fim - SNAP_MINUTOS)
      return { ...seguindo, inicioMin: inicio, duracao: fim - inicio }
    }
    const duracao = Math.max(SNAP_MINUTOS, minutos - atual.inicioMin)
    return { ...seguindo, duracao }
  }
  return atual
}

function compromissosDaColuna(
  chave: string,
  compromissos: CompromissoView[],
  gesto: Gesto | null,
  pouso: Pouso | null,
) {
  return compromissos.filter((item) => {
    if (gesto?.tipo === "mover" && gesto.id === item.id) {
      return chaveDia(new Date(item.comecaEm)) === chave
    }
    if (gesto?.tipo === "redimensionar" && gesto.id === item.id) return gesto.dia === chave
    if (pouso?.id === item.id) return pouso.dia === chave
    return !ehDiaInteiro(item) && chaveDia(new Date(item.comecaEm)) === chave
  })
}

function CabecalhoDia({
  chave,
  hoje,
  selecionado,
  unico,
}: {
  chave: string
  hoje: string
  selecionado: string
  unico: boolean
}) {
  const dia = diaDaChave(chave)
  const nome = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Cuiaba",
    weekday: "short",
  })
    .format(dia)
    .replace(".", "")
  const nomeLongo = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Cuiaba",
    weekday: "long",
  }).format(dia)
  const numero = partesCuiaba(dia).dia
  const atual = chave === hoje
  const ativo = chave === selecionado
  const marca = cn(
    "flex size-8 items-center justify-center leading-none",
    atual && "rounded-full bg-primary text-sm font-medium text-primary-foreground",
    ativo && !atual && "rounded-full bg-primary-selected text-sm font-medium",
    !atual && !ativo && "text-2xl",
    (atual || ativo) && "text-sm font-medium",
  )
  if (unico) {
    return (
      <div className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4">
        <span className={marca}>{numero}</span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{nome}</span>
          <span className="truncate text-sm font-semibold capitalize">{nomeLongo}</span>
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-l border-border",
        atual && "bg-calendar-today-bg",
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{nome}</span>
      <span className={marca}>{numero}</span>
    </div>
  )
}

function FaixaDiaInteiro({ dias, compromissos }: { dias: string[]; compromissos: CompromissoView[] }) {
  const porDia = dias.map((chave) =>
    compromissos.filter((item) => ehDiaInteiro(item) && chaveDia(new Date(item.comecaEm)) === chave),
  )
  if (porDia.every((lista) => lista.length === 0)) return null
  return (
    <div className="agenda-gutter flex shrink-0 overflow-y-auto border-b border-border">
      <div className={COLUNA_HORA} />
      {dias.map((chave, indice) => (
        <CelulaDiaInteiro key={chave} itens={porDia[indice] ?? []} />
      ))}
    </div>
  )
}

function CelulaDiaInteiro({ itens }: { itens: CompromissoView[] }) {
  const [aberto, setAberto] = useState(false)
  const limite = 2
  const visiveis = aberto ? itens : itens.slice(0, limite)
  const resto = itens.length - visiveis.length
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-l border-border p-1">
      {visiveis.map((item) => (
        <ChipDiaInteiro key={`${item.id}-${item.comecaEm}`} compromisso={item} />
      ))}
      {resto > 0 ? (
        <button type="button" className="text-left text-xs text-muted-foreground" onClick={() => setAberto(true)}>
          +{resto} mais
        </button>
      ) : null}
    </div>
  )
}

function ChipDiaInteiro({ compromisso }: { compromisso: CompromissoView }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button
        type="button"
        className="calendar-event truncate text-center text-xs font-semibold"
        onClick={() => setAberto(true)}
      >
        {compromisso.titulo}
      </button>
      {aberto ? (
        <FormularioCompromisso aberto aoFechar={setAberto} compromisso={compromisso} />
      ) : null}
    </>
  )
}

function ColunaHoraria({
  dia,
  ehHoje,
  compromissos,
  tarefas,
  gesto,
  pouso,
  expedienteInicio,
  expedienteFim,
  aoCriar,
  aoCliqueVazio,
  aoMover,
}: {
  dia: string
  ehHoje: boolean
  compromissos: CompromissoView[]
  tarefas: TarefaView[]
  gesto: Gesto | null
  pouso: Pouso | null
  expedienteInicio: string
  expedienteFim: string
  aoCriar: (evento: React.PointerEvent<HTMLElement>) => void
  aoCliqueVazio: (x: number, y: number, inicioMin: number) => void
  aoMover: (gesto: Gesto) => void
}) {
  const { coluna, colunas } = encaixar(compromissos)
  const [, iniciar] = useTransition()
  const faixaCriacao =
    gesto?.tipo === "criar" && gesto.dia === dia ? duracaoDaFaixa(gesto.origemMin, gesto.atualMin) : null

  function soltarTarefa(evento: React.DragEvent<HTMLDivElement>) {
    evento.preventDefault()
    const bruto = evento.dataTransfer.getData("application/x-agenda-tarefa") || evento.dataTransfer.getData("text/plain")
    const id = Number(String(bruto).replace("tarefa:", ""))
    if (!id) return
    const retangulo = evento.currentTarget.getBoundingClientRect()
    const hora = horarioDoMinuto(minutosNoPonto(evento.clientY, retangulo.top)).texto
    iniciar(async () => {
      const resultado = await bloquearTarefa({ tarefaId: id, data: dia, hora })
      if (resultado.erro) toast.error(resultado.erro)
    })
  }

  return (
    <div
      data-dia={dia}
      className={cn("relative min-w-0 flex-1 border-l border-border", ehHoje && "bg-calendar-today-bg")}
      onDragOver={(evento) => {
        evento.preventDefault()
        evento.dataTransfer.dropEffect = "copy"
      }}
      onDrop={soltarTarefa}
    >
      {ORDEM_HORAS.map((hora, indice) => (
        <button
          key={hora}
          type="button"
          aria-label={`Criar horário às ${String(hora).padStart(2, "0")}:00`}
          className={cn(
            "absolute inset-x-0 z-0 cursor-pointer border-t border-calendar-grid-line",
            horaForaDoExpediente(hora, expedienteInicio, expedienteFim) && "bg-calendar-off-hours",
          )}
          style={{ top: indice * ALTURA_HORA, height: ALTURA_HORA }}
          onPointerDown={aoCriar}
          onClick={(evento) => {
            evento.stopPropagation()
            const coluna = evento.currentTarget.closest("[data-dia]")
            const retangulo = coluna?.getBoundingClientRect()
            if (!retangulo) return
            aoCliqueVazio(evento.clientX, evento.clientY, minutosNoPonto(evento.clientY, retangulo.top))
          }}
        >
          <span
            className="pointer-events-none absolute inset-x-0 border-t border-calendar-grid-line-subtle"
            style={{ top: ALTURA_HORA / 2 }}
          />
        </button>
      ))}
      {faixaCriacao && Math.abs((gesto as Extract<Gesto, { tipo: "criar" }>).atualMin - (gesto as Extract<Gesto, { tipo: "criar" }>).origemMin) >= SNAP_MINUTOS ? (
        <div
          className="pointer-events-none absolute inset-x-1 z-[1] rounded-sm bg-primary/20 ring-1 ring-primary/40"
          style={{
            top: (faixaCriacao.inicio / 60) * ALTURA_HORA,
            height: (faixaCriacao.duracao / 60) * ALTURA_HORA,
          }}
        />
      ) : null}
      {gesto?.tipo === "mover" && gesto.arrastou && gesto.dia === dia ? (
        <div
          className="pointer-events-none absolute inset-x-1 z-[1] rounded-sm border border-dashed border-[#a47dab] bg-[rgba(164,125,171,0.15)]"
          style={{
            top: (gesto.inicioMin / 60) * ALTURA_HORA,
            height: (gesto.duracao / 60) * ALTURA_HORA,
          }}
        />
      ) : null}
      {compromissos.map((item) => {
        const redim = gesto?.tipo === "redimensionar" && gesto.id === item.id ? gesto : null
        const pousado = !redim && pouso?.id === item.id && pouso.dia === dia ? pouso : null
        const parteItem = partesCuiaba(new Date(item.comecaEm))
        const inicioMin = redim?.inicioMin ?? pousado?.inicioMin ?? minutosDoHorario(parteItem.hora, parteItem.minuto)
        const duracao = redim?.duracao ?? pousado?.duracao ?? item.duracaoMinutos
        const movendo = gesto?.tipo === "mover" && gesto.id === item.id && gesto.arrastou
        return (
          <div
            key={`${item.id}-${item.comecaEm}`}
            className={cn("absolute z-[1] min-w-0 px-px", !redim && "transition-[top,height] duration-100 ease-out")}
            style={{
              top: (inicioMin / 60) * ALTURA_HORA,
              height: Math.max(15, (duracao / 60) * ALTURA_HORA - 2),
              left: `calc((100% * ${coluna.get(item.id)!} + 2px) / ${colunas})`,
              width: `calc((100% - ${(colunas - 1) * 2}px) / ${colunas})`,
            }}
          >
            <BlocoHorario
              compromisso={item}
              arrastando={movendo}
              redimensionando={Boolean(redim)}
              aoGesto={aoMover}
            />
          </div>
        )
      })}
      {tarefas.map((tarefa) => (
        <MarcadorTarefa key={tarefa.id} tarefa={tarefa} />
      ))}
      {ehHoje ? <IndicadorAgora /> : null}
    </div>
  )
}

function MarcadorTarefa({ tarefa }: { tarefa: TarefaView }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button
        type="button"
        className="absolute z-[1] right-0 left-1 truncate border-l-2 border-primary bg-secondary px-2 py-0.5 text-center text-xs"
        style={{ top: topo(tarefa.venceEm!) }}
        onClick={() => setAberto(true)}
      >
        {horaCurta(new Date(tarefa.venceEm!))} {tarefa.titulo}
      </button>
      {aberto ? <FormularioTarefa aberto aoFechar={setAberto} tarefa={tarefa} /> : null}
    </>
  )
}

function BlocoHorario({
  compromisso,
  arrastando,
  redimensionando,
  aoGesto,
}: {
  compromisso: CompromissoView
  arrastando: boolean
  redimensionando: boolean
  aoGesto: (gesto: Gesto) => void
}) {
  const [aberto, setAberto] = useState(false)
  const inicio = new Date(compromisso.comecaEm)
  const parte = partesCuiaba(inicio)
  const inicioMin = minutosDoHorario(parte.hora, parte.minuto)
  const encerrado =
    compromisso.status === "feito" || compromisso.status === "cancelado" || compromisso.status === "apagada"
  const rotulo =
    compromisso.status === "feito" ? "Concluído" : compromisso.status === "cancelado" ? "Cancelado" : null
  const Charm = charmDoTitulo(compromisso.titulo)
  const ignorarClique = useRef(false)
  const curto = compromisso.duracaoMinutos <= 30

  function comecarMover(evento: React.PointerEvent) {
    if (evento.button !== 0 || encerrado) return
    evento.stopPropagation()
    const coluna = evento.currentTarget.closest("[data-dia]")
    const topo = coluna?.getBoundingClientRect().top
    const minutos = topo == null ? inicioMin : minutosNoPonto(evento.clientY, topo)
    const origem = { x: evento.clientX, y: evento.clientY }
    function soltar(proximo: PointerEvent) {
      const distancia = Math.hypot(proximo.clientX - origem.x, proximo.clientY - origem.y)
      if (distancia > LIMIAR_ARRASTE_PX) ignorarClique.current = true
      window.removeEventListener("pointerup", soltar)
    }
    window.addEventListener("pointerup", soltar)
    const cartao = evento.currentTarget.getBoundingClientRect()
    aoGesto({
      tipo: "mover",
      id: compromisso.id,
      dia: chaveDia(inicio),
      inicioMin,
      duracao: compromisso.duracaoMinutos,
      offsetMin: minutos - inicioMin,
      origemDia: chaveDia(inicio),
      origemInicio: inicioMin,
      arrastou: false,
      x: evento.clientX,
      y: evento.clientY,
      largura: cartao.width,
      offsetX: evento.clientX - cartao.left,
      offsetY: evento.clientY - cartao.top,
    })
  }

  function comecarRedimensionar(evento: React.PointerEvent, borda: "inicio" | "fim") {
    if (evento.button !== 0 || encerrado) return
    evento.stopPropagation()
    aoGesto({
      tipo: "redimensionar",
      id: compromisso.id,
      borda,
      dia: chaveDia(inicio),
      inicioMin,
      duracao: compromisso.duracaoMinutos,
      origemInicio: inicioMin,
      origemDuracao: compromisso.duracaoMinutos,
      x: evento.clientX,
      y: evento.clientY,
    })
  }

  return (
    <div className={cn("relative h-full min-h-0", arrastando && "pointer-events-none opacity-40")}>
      <button
        type="button"
        className={cn(
          "flex h-full w-full min-h-[15px] cursor-grab flex-col items-center justify-center overflow-hidden text-center active:cursor-grabbing",
          curto && "!px-1.5 !py-0",
          redimensionando && "opacity-50",
          encerrado ? "cursor-default rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground line-through" : "calendar-event",
        )}
        onPointerDown={comecarMover}
        onClick={(evento) => {
          evento.stopPropagation()
          if (ignorarClique.current) {
            ignorarClique.current = false
            return
          }
          setAberto(true)
        }}
      >
        <span className="flex w-full min-w-0 items-center justify-center gap-1 text-[12px] leading-none">
          {Charm ? <Charm className="size-3 shrink-0" aria-hidden /> : null}
          <span className="min-w-0 truncate">
            {horaCurta(inicio)} · {textoDuracao(compromisso.duracaoValor, compromisso.duracaoUnidade)}
            {curto ? ` ${compromisso.titulo}` : ""}
          </span>
          {compromisso.conflito ? (
            <span className="shrink-0 rounded bg-destructive/15 px-1 text-[10px] leading-4 text-destructive">Conflito</span>
          ) : null}
          {rotulo ? <span className="shrink-0 text-[10px]">{rotulo}</span> : null}
        </span>
        {curto ? null : (
          <span className="line-clamp-2 w-full text-center text-xs font-semibold leading-snug">{compromisso.titulo}</span>
        )}
      </button>
      {encerrado ? null : (
        <>
          <span
            className="absolute inset-x-0 -top-0.5 z-[2] h-1.5 cursor-ns-resize touch-none"
            onPointerDown={(evento) => comecarRedimensionar(evento, "inicio")}
          />
          <span
            className="absolute inset-x-0 -bottom-0.5 z-[2] h-1.5 cursor-ns-resize touch-none"
            onPointerDown={(evento) => comecarRedimensionar(evento, "fim")}
          />
        </>
      )}
      {aberto ? <FormularioCompromisso aberto aoFechar={setAberto} compromisso={compromisso} /> : null}
      <span className="sr-only">{textoQuando(compromisso.comecaEm)}</span>
    </div>
  )
}

function IndicadorAgora() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  const parte = partesCuiaba(agora)
  const indice = ORDEM_HORAS.indexOf(parte.hora)
  if (indice < 0) return null
  const top = (indice + parte.minuto / 60) * ALTURA_HORA
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[2]" style={{ top }} aria-hidden>
      <span className="absolute top-[-3px] left-0 size-2 rounded-full bg-calendar-current-time" />
      <span className="absolute inset-x-0 top-0 h-0.5 bg-calendar-current-time" />
    </div>
  )
}

function CloneArraste({
  gesto,
  compromisso,
}: {
  gesto: Extract<Gesto, { tipo: "mover" }>
  compromisso: CompromissoView | undefined
}) {
  if (!compromisso) return null
  return (
    <div
      className="calendar-event pointer-events-none fixed z-[70] flex origin-center scale-[1.02] flex-col items-center justify-center overflow-hidden text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
      style={{
        left: gesto.x - gesto.offsetX,
        top: gesto.y - gesto.offsetY,
        width: gesto.largura,
        height: Math.max(15, (gesto.duracao / 60) * ALTURA_HORA - 2),
      }}
    >
      <span className="truncate px-1 text-[12px] leading-none">{compromisso.titulo}</span>
    </div>
  )
}

function BadgeDuracao({ gesto }: { gesto: Extract<Gesto, { tipo: "redimensionar" }> }) {
  const inicio = horarioDoMinuto(gesto.inicioMin).texto
  const fim = horarioDoMinuto(gesto.inicioMin + gesto.duracao).texto
  return (
    <div
      className="pointer-events-none fixed z-[80] rounded bg-[#29242b] px-2 py-1 text-xs text-white"
      style={{ left: gesto.x + 14, top: gesto.y + 14 }}
    >
      {inicio} – {fim} ({textoEnxuto(gesto.duracao)})
    </div>
  )
}

function textoEnxuto(minutos: number) {
  if (minutos < 60) return `${minutos}m`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas}h ${resto}m` : `${horas}h`
}

function ehDiaInteiro(item: CompromissoView) {
  return item.duracaoUnidade === "dia" || item.duracaoUnidade === "semana"
}

function topo(iso: string) {
  const parte = partesCuiaba(new Date(iso))
  return (minutosDoHorario(parte.hora, parte.minuto) / 60) * ALTURA_HORA
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

function useQuantidadeColunas(maximo: number) {
  return useSyncExternalStore(
    (notificar) => {
      const xl = window.matchMedia("(min-width: 1280px)")
      const md = window.matchMedia("(min-width: 768px)")
      xl.addEventListener("change", notificar)
      md.addEventListener("change", notificar)
      return () => {
        xl.removeEventListener("change", notificar)
        md.removeEventListener("change", notificar)
      }
    },
    () => {
      if (window.matchMedia("(min-width: 1280px)").matches) return maximo
      if (window.matchMedia("(min-width: 768px)").matches) return Math.min(3, maximo)
      return 1
    },
    () => maximo,
  )
}

function fatiarDias(dias: string[], ancora: string, quantidade: number) {
  if (quantidade >= dias.length) return dias
  const indice = Math.max(0, dias.indexOf(ancora))
  if (quantidade === 1) return [dias[indice] ?? dias[0]!]
  const inicio = Math.min(Math.max(0, indice - 1), dias.length - quantidade)
  return dias.slice(inicio, inicio + quantidade)
}
