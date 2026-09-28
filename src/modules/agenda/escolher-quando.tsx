"use client"

import { useState } from "react"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { chaveCalendario, dataDoCalendario } from "@/modules/agenda/tempo"

const HORAS = Array.from({ length: 24 }, (_, hora) => String(hora).padStart(2, "0"))
const MINUTOS = Array.from({ length: 60 }, (_, minuto) => String(minuto).padStart(2, "0"))

export function textoData(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return "Escolher data"
  const [ano, mes, dia] = valor.split("-")
  return `${dia}/${mes}/${ano}`
}

export function EscolherData({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (valor: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const selecionada = valor ? dataDoCalendario(valor) : undefined
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger render={<Button variant="outline" className="min-h-11 w-full justify-start" />}>
        {textoData(valor)}
      </PopoverTrigger>
      <PopoverContent className="agenda-scroll w-80">
        <Calendar
          mode="single"
          locale={ptBR}
          captionLayout="dropdown"
          startMonth={new Date(2024, 0)}
          endMonth={new Date(2036, 11)}
          formatters={{
            formatWeekdayName: (dia) =>
              new Intl.DateTimeFormat("pt-BR", { weekday: "narrow" }).format(dia),
          }}
          selected={selecionada}
          onSelect={(dia) => {
            if (!dia) return
            aoMudar(chaveCalendario(dia))
            setAberto(false)
          }}
        />
        {valor ? (
          <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={() => aoMudar("")}>
            Sem data
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function EscolherHora({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (valor: string) => void
}) {
  const [hora, minuto] = valor.includes(":") ? valor.split(":") : ["", ""]

  function gravar(proximaHora: string | null, proximoMinuto: string | null) {
    if (!proximaHora || !proximoMinuto) return
    aoMudar(`${proximaHora}:${proximoMinuto}`)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={hora || null} onValueChange={(item) => gravar(item, minuto || "00")}>
          <SelectTrigger className="min-h-11 w-full font-mono" aria-label="Hora">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {HORAS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="font-mono text-muted-foreground">:</span>
        <Select value={minuto || null} onValueChange={(item) => gravar(hora || "00", item)}>
          <SelectTrigger className="min-h-11 w-full font-mono" aria-label="Minuto">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MINUTOS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {valor ? (
        <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={() => aoMudar("")}>
          Sem hora
        </Button>
      ) : null}
    </div>
  )
}
