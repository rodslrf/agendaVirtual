import Link from "next/link"
import { GradeHoraria } from "@/modules/agenda/grade-horaria"
import { chaveDia, instanteCuiaba, partesCuiaba, somarDias } from "@/modules/agenda/tempo"
import type { CompromissoView, TarefaView } from "@/modules/agenda/vistas"
import { cn } from "cn"

export function GradeSemana({
  inicio,
  itens,
  ancora,
  tarefas = [],
  expedienteInicio,
  expedienteFim,
}: {
  inicio: Date
  itens: CompromissoView[]
  ancora: string
  tarefas?: TarefaView[]
  expedienteInicio?: string
  expedienteFim?: string
}) {
  const dias = Array.from({ length: 7 }, (_, indice) => chaveDia(somarDias(inicio, indice)))
  return (
    <GradeHoraria
      dias={dias}
      compromissos={itens}
      ancora={ancora}
      tarefas={tarefas}
      preencher
      expedienteInicio={expedienteInicio}
      expedienteFim={expedienteFim}
    />
  )
}

export function GradeMes({ dia, itens }: { dia: Date; itens: CompromissoView[] }) {
  const parte = partesCuiaba(dia)
  const primeiro = instanteDoMes(parte.ano, parte.mes)
  const inicio = somarDias(primeiro, -diaSemana(primeiro))
  const celulas = Array.from({ length: 42 }, (_, indice) => somarDias(inicio, indice))
  const hoje = chaveDia(new Date())
  return (
    <div className="grid grid-cols-7 border-t border-l border-border">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((nome) => (
        <p key={nome} className="border-r border-b border-border px-2 py-1 text-center text-xs font-medium text-muted-foreground">
          {nome}
        </p>
      ))}
      {celulas.map((data) => {
        const chave = chaveDia(data)
        const doMes = partesCuiaba(data).mes === parte.mes
        const doDia = itens.filter((item) => chaveDia(new Date(item.comecaEm)) === chave)
        const atual = chave === hoje
        return (
          <Link
            key={chave}
            href={`/agenda?vista=dia&data=${chave}`}
            className={cn(
              "flex min-h-24 flex-col gap-1 border-r border-b border-border p-1 text-xs hover:bg-surface-hover",
              !doMes && "text-muted-foreground",
              atual && "bg-calendar-today-bg",
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center self-start font-medium",
                atual && "rounded-full bg-primary text-primary-foreground",
              )}
            >
              {partesCuiaba(data).dia}
            </span>
            {doDia.slice(0, 2).map((item) => (
              <span key={`${item.id}-${item.comecaEm}`} className="calendar-event truncate text-center text-[11px] font-semibold">
                {item.titulo}
              </span>
            ))}
            {doDia.length > 2 ? <span className="text-muted-foreground">+{doDia.length - 2} mais</span> : null}
          </Link>
        )
      })}
    </div>
  )
}

export function GradeAno({ dia, itens }: { dia: Date; itens: CompromissoView[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, mes) => {
        const parte = partesCuiaba(dia)
        const data = instanteDoMes(parte.ano, mes + 1)
        const quantidade = itens.filter((item) => partesCuiaba(new Date(item.comecaEm)).mes === mes + 1).length
        const nome = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Cuiaba", month: "long" }).format(data)
        return (
          <Link
            key={mes}
            href={`/agenda?vista=mes&data=${chaveDia(data)}`}
            className="flex min-h-24 flex-col justify-between rounded-md border border-border bg-card p-3 hover:bg-surface-hover"
          >
            <span className="text-sm font-medium capitalize">{nome}</span>
            <span className="text-2xl font-normal tabular-nums">{quantidade}</span>
          </Link>
        )
      })}
    </div>
  )
}

function instanteDoMes(ano: number, mes: number) {
  return instanteCuiaba(ano, mes, 1)
}

function diaSemana(data: Date) {
  const parte = partesCuiaba(data)
  return new Date(Date.UTC(parte.ano, parte.mes - 1, parte.dia)).getUTCDay()
}
