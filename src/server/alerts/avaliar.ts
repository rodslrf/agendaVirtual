import { db } from "@/server/db"
import { notificacoes } from "@/server/db/schema"
import { antecedencias, marcoAtual, podeRepetir } from "@/server/alerts/regras"
import {
  listarAbertosParaAvisos,
  lerAjustes,
  ultimaNotificacao,
  excecoesPorCompromisso,
} from "@/modules/agenda/consultas"
import { enviarPush } from "@/server/push/enviar"
import { chaveDia, horaCurta } from "@/modules/agenda/tempo"
import { ocorrenciaParaAviso, repeticaoValida } from "@/modules/agenda/repeticao"

function silencioVigente(ate: Date | null, agora: Date) {
  return Boolean(ate && ate > agora)
}

function horaOuAgora(data: Date | null) {
  if (!data) return "00:00"
  return `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`
}

async function disparar(entrada: {
  tipo: "urgente" | "prazo"
  alvoTipo: "tarefa" | "compromisso"
  alvoId: number
  marco: number | null
  repetirMinutos: number
  titulo: string
  quando: Date | null
  agora: Date
  serieInicio?: Date
  repeticao?: "nenhuma" | "diaria" | "cada_15_dias" | "semanal" | "mensal" | "anual"
  repeteAte?: Date | null
}) {
  const ultima = await ultimaNotificacao(
    entrada.alvoTipo,
    entrada.alvoId,
    entrada.tipo,
    entrada.marco,
  )
  const repete = Boolean(
    entrada.repeticao && entrada.repeticao !== "nenhuma" && entrada.serieInicio && entrada.quando,
  )
  if (ultima?.acusadaEm) {
    if (!repete) return false
    const daAcusacao = ocorrenciaParaAviso(
      entrada.serieInicio!,
      entrada.repeticao!,
      entrada.repeteAte ?? null,
      ultima.acusadaEm,
    )
    if (daAcusacao && daAcusacao.getTime() === entrada.quando!.getTime()) return false
  } else if (!podeRepetir(ultima?.disparadaEm ?? null, entrada.agora, entrada.repetirMinutos)) {
    return false
  }

  await db.insert(notificacoes).values({
    tipo: entrada.tipo,
    alvoTipo: entrada.alvoTipo,
    alvoId: entrada.alvoId,
    marcoMinutos: entrada.marco,
    disparadaEm: entrada.agora,
  })

  const caminho =
    entrada.alvoTipo === "tarefa"
      ? "/lista"
      : `/agenda?vista=dia&data=${entrada.quando ? chaveDia(entrada.quando) : chaveDia(entrada.agora)}`

  await enviarPush({
    titulo: entrada.titulo,
    corpo: entrada.quando ? `${entrada.titulo} · ${horaCurta(entrada.quando)}` : entrada.titulo,
    tipo: entrada.tipo,
    tag: `${entrada.alvoTipo}-${entrada.alvoId}-${entrada.tipo}`,
    url: caminho,
    alvoTipo: entrada.alvoTipo,
    alvoId: entrada.alvoId,
    hora: horaOuAgora(entrada.quando),
  })
  return true
}

export async function avaliar(agora = new Date()) {
  return avaliarAgora(agora)
}

async function avaliarAgora(agora: Date) {
  const ajustes = await lerAjustes()
  const offsets = antecedencias(ajustes.antecedenciasMinutos)
  const { tarefas, compromissos } = await listarAbertosParaAvisos()
  let enviados = 0

  for (const tarefa of tarefas) {
    if (silencioVigente(tarefa.silencioAte, agora)) continue
    const urgente = tarefa.prioridade === "urgente"
    if (urgente) {
      const ok = await disparar({
        tipo: "urgente",
        alvoTipo: "tarefa",
        alvoId: tarefa.id,
        marco: null,
        repetirMinutos: ajustes.urgenteRepetirMinutos,
        titulo: tarefa.titulo,
        quando: tarefa.venceEm,
        agora,
      })
      if (ok) enviados += 1
      continue
    }
    if (!tarefa.venceEm) continue
    const marco = marcoAtual(tarefa.venceEm, agora, offsets)
    if (marco === null) continue
    const ok = await disparar({
      tipo: "prazo",
      alvoTipo: "tarefa",
      alvoId: tarefa.id,
      marco,
      repetirMinutos: ajustes.aproximacaoRepetirMinutos,
      titulo: tarefa.titulo,
      quando: tarefa.venceEm,
      agora,
    })
    if (ok) enviados += 1
  }

  const excecoes = await excecoesPorCompromisso()
  for (const horario of compromissos) {
    if (silencioVigente(horario.silencioAte, agora)) continue
    const repeticao = horario.repeticao && repeticaoValida(horario.repeticao) ? horario.repeticao : "nenhuma"
    const quando = ocorrenciaParaAviso(
      horario.comecaEm,
      repeticao,
      horario.repeteAte,
      agora,
      excecoes.get(horario.id),
    )
    if (!quando) continue
    const marco = marcoAtual(quando, agora, offsets)
    if (marco === null) continue
    const ok = await disparar({
      tipo: "prazo",
      alvoTipo: "compromisso",
      alvoId: horario.id,
      marco,
      repetirMinutos: ajustes.aproximacaoRepetirMinutos,
      titulo: horario.titulo,
      quando,
      agora,
      serieInicio: horario.comecaEm,
      repeticao,
      repeteAte: horario.repeteAte,
    })
    if (ok) enviados += 1
  }

  return enviados
}
