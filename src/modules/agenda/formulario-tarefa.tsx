"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { salvarTarefa, apagarTarefa } from "@/modules/agenda/acoes"
import { partirDataHora } from "@/modules/agenda/tempo"
import type { TarefaView } from "@/modules/agenda/vistas"
import { Superficie } from "@/modules/agenda/superficie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EscolherData, EscolherHora } from "@/modules/agenda/escolher-quando"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function FormularioTarefa({
  aberto,
  aoFechar,
  tarefa,
  dataInicial,
  horaInicial,
}: {
  aberto: boolean
  aoFechar: (aberto: boolean) => void
  tarefa?: TarefaView
  dataInicial?: string
  horaInicial?: string
}) {
  const partes = partirDataHora(tarefa?.venceEm ?? null)
  const [data, setData] = useState(partes.data || dataInicial || "")
  const [hora, setHora] = useState(partes.hora || horaInicial || "")
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "")
  const [notas, setNotas] = useState(tarefa?.notas ?? "")
  const [etapas, setEtapas] = useState(String(tarefa?.etapas.length || 1))
  const [prioridade, setPrioridade] = useState(tarefa?.prioridade ?? "normal")
  const [pendente, iniciar] = useTransition()

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarTarefa({
        id: tarefa?.id,
        titulo,
        notas,
        data,
        hora,
        etapas: Number(etapas),
        prioridade,
      })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      aoFechar(false)
    })
  }

  function apagar() {
    if (!tarefa) return
    iniciar(async () => {
      await apagarTarefa(tarefa.id)
      aoFechar(false)
    })
  }

  return (
    <Superficie
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={tarefa ? "Editar tarefa" : "Nova tarefa"}
      descricao="Nome, prazo e quantas etapas ela tem."
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="tarefa-titulo">Tarefa</FieldLabel>
          <Input
            id="tarefa-titulo"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            className="min-h-11"
            autoFocus
          />
        </Field>
        <div className="flex gap-3">
          <Field>
            <FieldLabel>Data</FieldLabel>
            <EscolherData valor={data} aoMudar={setData} />
          </Field>
          <Field>
            <FieldLabel>Hora</FieldLabel>
            <EscolherHora valor={hora} aoMudar={setHora} />
          </Field>
        </div>
        <FieldDescription>Sem hora, o prazo fica às 9h desse dia.</FieldDescription>
        <Field>
          <FieldLabel htmlFor="tarefa-etapas">Etapas</FieldLabel>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              aria-label="Diminuir etapas"
              onClick={() => setEtapas((atual) => String(Math.max(1, (Number(atual) || 1) - 1)))}
            >
              <MinusIcon data-icon="inline-start" />
            </Button>
            <Input
              id="tarefa-etapas"
              inputMode="numeric"
              value={etapas}
              onChange={(evento) => setEtapas(evento.target.value.replace(/\D/g, "").slice(0, 2))}
              className="min-h-11 text-center"
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              aria-label="Aumentar etapas"
              onClick={() => setEtapas((atual) => String(Math.min(12, (Number(atual) || 1) + 1)))}
            >
              <PlusIcon data-icon="inline-start" />
            </Button>
          </div>
          <FieldDescription>De 1 a 12. As novas etapas entram no fim.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Prioridade</FieldLabel>
          <ToggleGroup
            value={[prioridade]}
            onValueChange={(valor) => {
              const proxima = valor[0]
              if (proxima === "normal" || proxima === "importante" || proxima === "urgente") {
                setPrioridade(proxima)
              }
            }}
            spacing={2}
          >
            <ToggleGroupItem value="normal" className="min-h-11">Normal</ToggleGroupItem>
            <ToggleGroupItem value="importante" className="min-h-11">Importante</ToggleGroupItem>
            <ToggleGroupItem value="urgente" className="min-h-11">Urgente</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="tarefa-notas">Notas</FieldLabel>
          <Textarea
            id="tarefa-notas"
            value={notas}
            onChange={(evento) => setNotas(evento.target.value)}
            rows={3}
            className="field-sizing-fixed min-h-20"
          />
        </Field>
        <div className="flex flex-col gap-2">
          <Button type="button" className="min-h-11" disabled={pendente} onClick={salvar}>
            Salvar
          </Button>
          {tarefa ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              disabled={pendente}
              onClick={apagar}
            >
              Apagar tarefa
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </Superficie>
  )
}
