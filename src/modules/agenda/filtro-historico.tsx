"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { EscolherData } from "@/modules/agenda/escolher-quando"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function FiltroHistorico({
  q,
  prioridade,
  data,
}: {
  q: string
  prioridade: string
  data: string
}) {
  const router = useRouter()
  const [texto, setTexto] = useState(q)
  const [dia, setDia] = useState(data)
  const [nivel, setNivel] = useState(prioridade)

  function aplicar() {
    const params = new URLSearchParams()
    if (texto.trim()) params.set("q", texto.trim())
    if (nivel) params.set("prioridade", nivel)
    if (dia) params.set("data", dia)
    const consulta = params.toString()
    router.push(consulta ? `/historico?${consulta}` : "/historico")
  }

  return (
    <form
      className="grid gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
      onSubmit={(evento) => {
        evento.preventDefault()
        aplicar()
      }}
    >
      <Field>
        <FieldLabel htmlFor="historico-q">Pesquisar</FieldLabel>
        <Input
          id="historico-q"
          value={texto}
          placeholder="Nome, nota ou etapa"
          className="min-h-11"
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>Prioridade</FieldLabel>
        <ToggleGroup
          variant="outline"
          value={nivel ? [nivel] : []}
          onValueChange={(valor) => setNivel(valor[0] ?? "")}
          spacing={2}
        >
          <ToggleGroupItem value="normal" className="min-h-11">Normal</ToggleGroupItem>
          <ToggleGroupItem value="importante" className="min-h-11">Importante</ToggleGroupItem>
          <ToggleGroupItem value="urgente" className="min-h-11">Urgente</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <Field>
        <FieldLabel>Data</FieldLabel>
        <EscolherData valor={dia} aoMudar={setDia} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" className="min-h-11">Filtrar</Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            setTexto("")
            setDia("")
            setNivel("")
            router.push("/historico")
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  )
}
