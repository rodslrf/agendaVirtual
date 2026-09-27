"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormularioCompromisso } from "@/modules/agenda/formulario-compromisso"
import { FormularioTarefa } from "@/modules/agenda/formulario-tarefa"

export function BotoesNovos({ data }: { data?: string }) {
  const [tarefa, setTarefa] = useState(false)
  const [horario, setHorario] = useState(false)
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="button" className="min-h-11" onClick={() => setTarefa(true)}>
        <PlusIcon data-icon="inline-start" />
        Nova tarefa
      </Button>
      <Button type="button" variant="outline" className="min-h-11" onClick={() => setHorario(true)}>
        Novo horário
      </Button>
      {tarefa ? (
        <FormularioTarefa aberto aoFechar={setTarefa} dataInicial={data} />
      ) : null}
      {horario ? (
        <FormularioCompromisso aberto aoFechar={setHorario} dataInicial={data} />
      ) : null}
    </div>
  )
}
