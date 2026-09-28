"use client"

import { GradeHoraria } from "@/modules/agenda/grade-horaria"
import type { CompromissoView, TarefaView } from "@/modules/agenda/vistas"

export function ColunaDia({
  compromissos,
  tarefas,
  data,
  preencher = false,
  expedienteInicio,
  expedienteFim,
}: {
  compromissos: CompromissoView[]
  tarefas: TarefaView[]
  data: string
  preencher?: boolean
  expedienteInicio?: string
  expedienteFim?: string
}) {
  return (
    <GradeHoraria
      dias={[data]}
      compromissos={compromissos}
      tarefas={tarefas}
      ancora={data}
      preencher={preencher}
      expedienteInicio={expedienteInicio}
      expedienteFim={expedienteFim}
    />
  )
}
