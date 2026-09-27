"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { cancelarCompromisso, concluirCompromisso, nomesEmConflito, pularOcorrencia, reabrirCompromisso, salvarCompromisso } from "@/modules/agenda/acoes"
import { partirDataHora } from "@/modules/agenda/tempo"
import { EscolherData, EscolherHora } from "@/modules/agenda/escolher-quando"
import { REPETICOES, ROTULO_REPETICAO, type Repeticao } from "@/modules/agenda/repeticao"
import { converterUnidade, ROTULO_UNIDADE, UNIDADES, unidadeValida, type UnidadeDuracao } from "@/modules/agenda/duracao"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { CompromissoView } from "@/modules/agenda/vistas"
import { Superficie } from "@/modules/agenda/superficie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function FormularioCompromisso({
  aberto,
  aoFechar,
  compromisso,
  dataInicial,
  horaInicial,
}: {
  aberto: boolean
  aoFechar: (aberto: boolean) => void
  compromisso?: CompromissoView
  dataInicial?: string
  horaInicial?: string
}) {
  const partes = partirDataHora(compromisso?.serieComecaEm ?? null)
  const [titulo, setTitulo] = useState(compromisso?.titulo ?? "")
  const [notas, setNotas] = useState(compromisso?.notas ?? "")
  const [data, setData] = useState(partes.data || dataInicial || "")
  const [hora, setHora] = useState(partes.hora || horaInicial || "")
  const [duracao, setDuracao] = useState(String(compromisso?.duracaoValor ?? compromisso?.duracaoMinutos ?? 60))
  const [unidade, setUnidade] = useState<UnidadeDuracao>(compromisso?.duracaoUnidade ?? "minuto")
  const [repeticao, setRepeticao] = useState<Repeticao>(compromisso?.repeticao ?? "nenhuma")
  const [repeteAte, setRepeteAte] = useState(partirDataHora(compromisso?.repeteAte ?? null).data)
  const [conflitos, setConflitos] = useState<string[]>([])
  const [perguntarApagar, setPerguntarApagar] = useState(false)
  const [pendente, iniciar] = useTransition()

  useEffect(() => {
    let vivo = true
    nomesEmConflito({
      id: compromisso?.id,
      data,
      hora,
      duracaoValor: Number(duracao) || 0,
      duracaoUnidade: unidade,
      repeticao,
      repeteAte,
    }).then((nomes) => {
      if (vivo) setConflitos(nomes)
    })
    return () => {
      vivo = false
    }
  }, [compromisso?.id, data, hora, duracao, unidade, repeticao, repeteAte])

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarCompromisso({
        id: compromisso?.id,
        titulo,
        notas,
        data,
        hora,
        duracaoValor: Number(duracao),
        duracaoUnidade: unidade,
        repeticao,
        repeteAte,
      })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      aoFechar(false)
    })
  }

  function pedirApagar() {
    if (!compromisso) return
    if (compromisso.repeticao === "nenhuma") {
      iniciar(async () => {
        await cancelarCompromisso(compromisso.id)
        aoFechar(false)
      })
      return
    }
    setPerguntarApagar(true)
  }

  return (
    <Superficie
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={compromisso ? "Editar horário" : "Novo horário"}
      descricao="Nome da pessoa ou do assunto, início e duração."
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="horario-titulo">Quem ou o quê</FieldLabel>
          <Input
            id="horario-titulo"
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
        <Field>
          <FieldLabel htmlFor="horario-duracao">Duração</FieldLabel>
          <Input
            id="horario-duracao"
            inputMode="numeric"
            value={duracao}
            onChange={(evento) => setDuracao(evento.target.value.replace(/\D/g, "").slice(0, 3))}
            className="min-h-11"
          />
          <ToggleGroup
            value={[unidade]}
            onValueChange={(valor) => {
              const proxima = valor[0]
              if (!proxima || !unidadeValida(proxima) || proxima === unidade) return
              setDuracao(String(converterUnidade(Number(duracao) || 1, unidade, proxima)))
              setUnidade(proxima)
            }}
            spacing={2}
            className="flex-wrap"
          >
            {UNIDADES.map((item) => (
              <ToggleGroupItem key={item} value={item} className="min-h-11">
                {ROTULO_UNIDADE[item]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel>Repete</FieldLabel>
          <ToggleGroup
            value={[repeticao]}
            onValueChange={(valor) => {
              if (valor[0]) setRepeticao(valor[0] as Repeticao)
            }}
            spacing={2}
            className="flex-wrap"
          >
            {REPETICOES.map((item) => (
              <ToggleGroupItem key={item} value={item} className="min-h-11">
                {ROTULO_REPETICAO[item]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        {repeticao !== "nenhuma" ? (
          <Field>
            <FieldLabel htmlFor="horario-ate">Repetir até</FieldLabel>
            <EscolherData valor={repeteAte} aoMudar={setRepeteAte} />
          </Field>
        ) : null}
        {conflitos.length > 0 ? (
          <Alert>
            <AlertTitle>Conflito de horário</AlertTitle>
            <AlertDescription>
              Cruza com {conflitos.join(", ")}. Pode continuar: mais de um compromisso no mesmo horário é permitido.
            </AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="horario-notas">Notas</FieldLabel>
          <Textarea
            id="horario-notas"
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
          {compromisso?.status === "marcado" ? (
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              disabled={pendente}
              onClick={() => iniciar(async () => {
                await concluirCompromisso(compromisso.id)
                aoFechar(false)
              })}
            >
              Concluir
            </Button>
          ) : null}
          {compromisso?.status === "feito" ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={pendente}
              onClick={() => iniciar(async () => {
                await reabrirCompromisso(compromisso.id)
                aoFechar(false)
              })}
            >
              Reabrir
            </Button>
          ) : null}
          {compromisso ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              disabled={pendente}
              onClick={pedirApagar}
            >
              Apagar horário
            </Button>
          ) : null}
          {perguntarApagar && compromisso ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={pendente}
                onClick={() => iniciar(async () => {
                  await pularOcorrencia(compromisso.id, compromisso.comecaEm)
                  aoFechar(false)
                })}
              >
                Só esta vez
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-destructive"
                disabled={pendente}
                onClick={() => iniciar(async () => {
                  await cancelarCompromisso(compromisso.id)
                  aoFechar(false)
                })}
              >
                Todas as vezes
              </Button>
            </div>
          ) : null}
        </div>
      </FieldGroup>
    </Superficie>
  )
}
