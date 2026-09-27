import Link from "next/link"
import { chaveDia, horaCurta, instanteCuiaba, partesCuiaba, somarDias } from "@/modules/agenda/tempo"
import type { CompromissoView } from "@/modules/agenda/vistas"

export function GradeSemana({ inicio, itens }: { inicio: Date; itens: CompromissoView[] }) {
  const dias = Array.from({ length: 7 }, (_, indice) => somarDias(inicio, indice))
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {dias.map((dia) => {
        const chave = chaveDia(dia)
        const doDia = itens.filter((item) => chaveDia(new Date(item.comecaEm)) === chave)
        const nome = new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Cuiaba",
          weekday: "short",
          day: "numeric",
        }).format(dia)
        return (
          <section key={chave} className="flex min-h-28 min-w-0 flex-col gap-2 rounded-xl bg-card p-2 ring-1 ring-foreground/10">
            <Link href={`/agenda?vista=dia&data=${chave}`} className="truncate text-sm font-medium capitalize">
              {nome}
            </Link>
            {doDia.map((item) => (
              <p key={`${item.id}-${item.comecaEm}`} className="truncate rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
                {horaCurta(new Date(item.comecaEm))} {item.titulo}
                {item.conflito ? " · Conflito" : ""}
              </p>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export function GradeMes({ dia, itens }: { dia: Date; itens: CompromissoView[] }) {
  const parte = partesCuiaba(dia)
  const primeiro = instanteDoMes(parte.ano, parte.mes)
  const inicio = somarDias(primeiro, -diaSemana(primeiro))
  const celulas = Array.from({ length: 42 }, (_, indice) => somarDias(inicio, indice))
  return (
    <div className="grid grid-cols-7 gap-1">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((nome) => (
        <p key={nome} className="px-1 text-center text-xs text-muted-foreground">
          {nome}
        </p>
      ))}
      {celulas.map((data) => {
        const chave = chaveDia(data)
        const doMes = partesCuiaba(data).mes === parte.mes
        const doDia = itens.filter((item) => chaveDia(new Date(item.comecaEm)) === chave)
        return (
          <Link
            key={chave}
            href={`/agenda?vista=dia&data=${chave}`}
            className={`flex min-h-16 flex-col gap-1 rounded-lg p-1 text-xs ring-1 ring-foreground/10 ${
              doMes ? "bg-card" : "text-muted-foreground"
            }`}
          >
            <span className="font-medium">{partesCuiaba(data).dia}</span>
            {doDia.slice(0, 2).map((item) => (
              <span key={`${item.id}-${item.comecaEm}`} className="truncate rounded bg-primary px-1 text-primary-foreground">
                {item.titulo}
              </span>
            ))}
            {doDia.length > 2 ? <span>+{doDia.length - 2}</span> : null}
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
            className="flex min-h-24 flex-col justify-between rounded-xl bg-card p-3 ring-1 ring-foreground/10"
          >
            <span className="text-sm font-medium capitalize">{nome}</span>
            <span className="text-2xl font-semibold tabular-nums">{quantidade}</span>
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
