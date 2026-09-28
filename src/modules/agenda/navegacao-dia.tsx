"use client"

import { useRouter } from "next/navigation"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { acrescentarMinutos, chaveCalendario, dataDoCalendario, diaDaChave, tituloDia } from "@/modules/agenda/tempo"

export function NavegacaoDia({ data }: { data: string }) {
  const roteador = useRouter()
  const dia = diaDaChave(data)

  function ir(destino: Date | undefined) {
    if (!destino) return
    roteador.push(`/dia?data=${chaveCalendario(destino)}`)
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={() => ir(acrescentarMinutos(dia, -24 * 60))}
      >
        Anterior
      </Button>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" className="min-h-11" />}>
          {tituloDia(dia)}
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={dataDoCalendario(data)} onSelect={ir} locale={ptBR} />
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={() => ir(acrescentarMinutos(dia, 24 * 60))}
      >
        Próximo
      </Button>
    </div>
  )
}
