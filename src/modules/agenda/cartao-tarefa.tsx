"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { PencilIcon } from "lucide-react"
import {
  alternarEtapa,
  concluirTarefa,
  reabrirTarefa,
  renomearEtapa,
} from "@/modules/agenda/acoes"
import { textoQuando } from "@/modules/agenda/tempo"
import type { EtapaView, TarefaView } from "@/modules/agenda/vistas"
import { FormularioTarefa } from "@/modules/agenda/formulario-tarefa"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export function CartaoTarefa({ tarefa }: { tarefa: TarefaView }) {
  const [editando, setEditando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, iniciar] = useTransition()
  const feitas = tarefa.etapas.filter((etapa) => etapa.feita).length
  const progresso = tarefa.etapas.length === 0 ? 0 : (feitas / tarefa.etapas.length) * 100

  function concluir() {
    iniciar(async () => {
      await concluirTarefa(tarefa.id)
      setConfirmar(false)
    })
  }

  function pedirConcluir() {
    if (tarefa.etapas.some((etapa) => !etapa.feita)) {
      setConfirmar(true)
      return
    }
    concluir()
  }

  function marcar(etapa: EtapaView, ligada: boolean) {
    iniciar(async () => {
      await alternarEtapa(etapa.id, ligada)
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className={tarefa.status !== "aberta" ? "text-muted-foreground line-through" : undefined}>
            {tarefa.titulo}
          </CardTitle>
          <div className="flex items-center gap-2">
            {tarefa.status === "aberta" ? (
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                disabled={pendente}
                onClick={pedirConcluir}
              >
                Concluir
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={pendente}
                onClick={() => iniciar(async () => reabrirTarefa(tarefa.id))}
              >
                Reabrir
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Editar tarefa"
              onClick={() => setEditando(true)}
            >
              <PencilIcon />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{textoQuando(tarefa.venceEm)}</span>
          {tarefa.prioridade === "urgente" ? <Badge variant="destructive">Urgente</Badge> : null}
          {tarefa.prioridade === "importante" ? <Badge variant="secondary">Importante</Badge> : null}
          {tarefa.status === "apagada" ? <Badge variant="outline">Apagada</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tarefa.notas ? <p className="text-sm text-muted-foreground">{tarefa.notas}</p> : null}
        <Progress value={progresso} aria-label={`${feitas} de ${tarefa.etapas.length} etapas`} />
        <ul className="flex flex-col gap-2">
          {tarefa.etapas.map((etapa) => (
            <li key={etapa.id} className="flex items-center gap-3">
              <Checkbox
                checked={etapa.feita}
                onCheckedChange={(marcada) => marcar(etapa, marcada === true)}
                aria-label={etapa.titulo}
              />
              <CampoEtapa
                etapa={etapa}
                aoRenomear={(novo) => {
                  iniciar(async () => {
                    const resultado = await renomearEtapa(etapa.id, novo)
                    if (resultado.erro) toast.error(resultado.erro)
                  })
                }}
              />
            </li>
          ))}
        </ul>
      </CardContent>
      {editando ? (
        <FormularioTarefa aberto aoFechar={setEditando} tarefa={tarefa} />
      ) : null}
      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que quer concluir a tarefa incompleta?</AlertDialogTitle>
            <AlertDialogDescription>Ainda há etapas sem marcar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={concluir}>Concluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function CampoEtapa({
  etapa,
  aoRenomear,
}: {
  etapa: EtapaView
  aoRenomear: (nome: string) => void
}) {
  const [nome, setNome] = useState(etapa.titulo)

  return (
    <Input
      value={nome}
      aria-label={`Nome da ${etapa.titulo}`}
      className="h-9 border-transparent bg-transparent shadow-none"
      onChange={(evento) => setNome(evento.target.value)}
      onBlur={() => {
        const novo = nome.trim()
        if (!novo || novo === etapa.titulo) {
          setNome(etapa.titulo)
          return
        }
        aoRenomear(novo)
      }}
    />
  )
}
