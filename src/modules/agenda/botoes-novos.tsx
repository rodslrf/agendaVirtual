"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormularioCompromisso } from "@/modules/agenda/formulario-compromisso"
import { FormularioTarefa } from "@/modules/agenda/formulario-tarefa"
import { cn } from "cn"

export function BotoesNovos({
  data,
  variante = "linha",
}: {
  data?: string
  variante?: "linha" | "lateral"
}) {
  const [tarefa, setTarefa] = useState(false)
  const [horario, setHorario] = useState(false)
  const lateral = variante === "lateral"
  return (
    <div className={cn("flex gap-2", lateral ? "flex-col" : "flex-col sm:flex-row")}>
      <Button
        type="button"
        className={cn(lateral ? "h-10 w-full" : "min-h-11")}
        onClick={() => setHorario(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo horário
      </Button>
      <Button
        type="button"
        variant="outline"
        className={cn(lateral ? "h-10 w-full border-border bg-background text-foreground" : "min-h-11")}
        onClick={() => setTarefa(true)}
      >
        Nova tarefa
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
