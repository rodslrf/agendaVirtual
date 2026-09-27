"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { chaveDia, diaDaChave, moverVista, tituloVista, type VistaAgenda } from "@/modules/agenda/tempo"

export function SeletorVista({ vista, data }: { vista: VistaAgenda; data: string }) {
  return (
    <Tabs value={vista}>
      <TabsList className="grid h-11! w-full grid-cols-4">
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
            className="h-9!"
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

  function ir(destino: Date | undefined) {
    if (!destino) return
    roteador.push(`/agenda?vista=${vista}&data=${chaveDia(destino)}`)
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={() => ir(moverVista(dia, vista, -1))}
      >
        Anterior
      </Button>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" className="min-h-11" />}>
          {tituloVista(dia, vista)}
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={dia} onSelect={ir} locale={ptBR} />
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={() => ir(moverVista(dia, vista, 1))}
      >
        Próximo
      </Button>
    </div>
  )
}
