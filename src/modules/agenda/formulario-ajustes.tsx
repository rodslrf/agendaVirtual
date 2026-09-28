"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { salvarAjustes } from "@/modules/agenda/acoes"
import { EscolherHora } from "@/modules/agenda/escolher-quando"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const AVISOS = [
  { minutos: 15, rotulo: "15 min antes" },
  { minutos: 60, rotulo: "1 hora antes" },
  { minutos: 120, rotulo: "2 horas antes" },
  { minutos: 1440, rotulo: "1 dia antes" },
]

const REPETIR = [
  { minutos: 15, rotulo: "15 min" },
  { minutos: 30, rotulo: "30 min" },
  { minutos: 60, rotulo: "1 hora" },
  { minutos: 120, rotulo: "2 horas" },
]

function maisProximo(valor: number, opcoes: number[]) {
  return opcoes.reduce((melhor, atual) =>
    Math.abs(atual - valor) < Math.abs(melhor - valor) ? atual : melhor,
  )
}

function avisosIniciais(texto: string) {
  const marcas = new Set(AVISOS.map((item) => item.minutos))
  const escolhidos = texto
    .split(",")
    .map((parte) => Number(parte.trim()))
    .filter((numero) => marcas.has(numero))
  return (escolhidos.length > 0 ? escolhidos : [1440, 120]).map(String)
}

export function FormularioAjustes({
  antecedenciasMinutos,
  urgenteRepetirMinutos,
  aproximacaoRepetirMinutos,
  som,
  expedienteInicio,
  expedienteFim,
}: {
  antecedenciasMinutos: string
  urgenteRepetirMinutos: number
  aproximacaoRepetirMinutos: number
  som: boolean
  expedienteInicio: string
  expedienteFim: string
}) {
  const [antecedencias, setAntecedencias] = useState(avisosIniciais(antecedenciasMinutos))
  const [urgente, setUrgente] = useState(
    String(maisProximo(urgenteRepetirMinutos, REPETIR.map((item) => item.minutos))),
  )
  const [aproximacao, setAproximacao] = useState(
    String(maisProximo(aproximacaoRepetirMinutos, REPETIR.map((item) => item.minutos))),
  )
  const [somLigado, setSomLigado] = useState(som)
  const [inicio, setInicio] = useState(expedienteInicio || "08:00")
  const [fim, setFim] = useState(expedienteFim || "18:00")
  const [pendente, iniciar] = useTransition()

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarAjustes({
        antecedenciasMinutos: antecedencias.join(","),
        urgenteRepetirMinutos: Number(urgente),
        aproximacaoRepetirMinutos: Number(aproximacao),
        som: somLigado,
        expedienteInicio: inicio,
        expedienteFim: fim,
      })
      if (resultado.erro) toast.error(resultado.erro)
      else toast.success("Avisos atualizados")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quando avisar</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Antes do horário</FieldLabel>
            <ToggleGroup
              multiple
              variant="outline"
              value={antecedencias}
              onValueChange={(valor) => valor.length > 0 && setAntecedencias(valor)}
              spacing={2}
              className="flex-wrap"
            >
              {AVISOS.map((item) => (
                <ToggleGroupItem key={item.minutos} value={String(item.minutos)} className="min-h-11">
                  {item.rotulo}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>Na hora marcada o aviso aparece sozinho.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Urgente, lembrar de novo</FieldLabel>
            <ToggleGroup
              variant="outline"
              value={[urgente]}
              onValueChange={(valor) => valor[0] && setUrgente(valor[0])}
              spacing={2}
              className="flex-wrap"
            >
              {REPETIR.map((item) => (
                <ToggleGroupItem key={item.minutos} value={String(item.minutos)} className="min-h-11">
                  {item.rotulo}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>Repete até você tocar em Já vi, adiar ou concluir.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Prazo, lembrar de novo</FieldLabel>
            <ToggleGroup
              variant="outline"
              value={[aproximacao]}
              onValueChange={(valor) => valor[0] && setAproximacao(valor[0])}
              spacing={2}
              className="flex-wrap"
            >
              {REPETIR.map((item) => (
                <ToggleGroupItem key={item.minutos} value={String(item.minutos)} className="min-h-11">
                  {item.rotulo}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel>Expediente</FieldLabel>
            <div className="flex gap-3">
              <EscolherHora valor={inicio} aoMudar={setInicio} />
              <EscolherHora valor={fim} aoMudar={setFim} />
            </div>
            <FieldDescription>Fora desse intervalo a grade fica cinza, mas ainda dá para marcar horário.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Switch id="som" checked={somLigado} onCheckedChange={setSomLigado} />
            <FieldLabel htmlFor="som">Som quando o aviso aparece no site</FieldLabel>
          </Field>
          <Button type="button" className="min-h-11" disabled={pendente} onClick={salvar}>
            Salvar
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
