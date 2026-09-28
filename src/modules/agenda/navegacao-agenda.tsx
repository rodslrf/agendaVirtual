"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { chaveDia, diaDaChave, moverVista, tituloVista, type VistaAgenda } from "@/modules/agenda/tempo"

export function SeletorVista({ vista, data }: { vista: VistaAgenda; data: string }) {
  return (
    <Tabs value={vista}>
      <TabsList className="grid h-9 w-full grid-cols-4 sm:w-auto">
        {([
          ["dia", "Dia"],
          ["semana", "Semana"],
          ["mes", "Mês"],
          ["ano", "Ano"],
        ] as const).map(([valor, rotulo]) => (
          <TabsTrigger
            key={valor}
            value={valor}
            nativeButton={false}
            render={<Link href={`/agenda?vista=${valor}&data=${data}`} />}
            className="h-7 px-2.5"
          >
            {rotulo}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function NavegacaoAgenda({ data, vista }: { data: string; vista: VistaAgenda }) {
  const roteador = useRouter()
  const dia = diaDaChave(data)
  const hoje = chaveDia(new Date())

  function ir(destino: Date) {
    roteador.push(`/agenda?vista=${vista}&data=${chaveDia(destino)}`)
  }

  return (
    <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-border px-4 py-2 lg:px-6">
      <Button type="button" variant="outline" className="h-8" onClick={() => ir(new Date())}>
        Hoje
      </Button>
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Período anterior"
          onClick={() => ir(moverVista(dia, vista, -1))}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Próximo período"
          onClick={() => ir(moverVista(dia, vista, 1))}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <h1 className="min-w-0 flex-1 text-[20px] font-semibold tracking-tight">
        {tituloVista(dia, vista)}
      </h1>
      <SeletorVista vista={vista} data={data} />
      {data !== hoje ? <span className="sr-only">Não é o período de hoje</span> : null}
    </div>
  )
}
