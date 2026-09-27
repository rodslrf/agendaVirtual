import { and, asc, desc, eq, gte, inArray, isNull, like, lt, ne, or } from "drizzle-orm"
import { db } from "@/server/db"
import {
  alertSettings,
  compromissoExcecoes,
  compromissos,
  notificacoes,
  pushSubscriptions,
  tarefaEtapas,
  tarefas,
} from "@/server/db/schema"
import { antecedencias, marcoAtual } from "@/server/alerts/regras"
import { ocorrenciaParaAviso, ocorrenciasEntre, repeticaoValida } from "@/modules/agenda/repeticao"
import { chaveDia, dataCurta, diaDaChave, fimDoDia, horaCurta, inicioDoDia, textoQuando } from "@/modules/agenda/tempo"
import type { AvisoVisivel } from "@/modules/agenda/vistas"

export type EtapaLinha = {
  id: number
  ordem: number
  titulo: string
  feita: boolean
}

export type TarefaLinha = {
  id: number
  titulo: string
  notas: string | null
  status: "aberta" | "feita" | "apagada"
  prioridade: "normal" | "importante" | "urgente"
  venceEm: Date | null
  silencioAte: Date | null
  etapas: EtapaLinha[]
}

function booleano(valor: unknown) {
  return valor === true || valor === 1
}

async function anexarEtapas(
  linhas: Array<Omit<TarefaLinha, "etapas">>,
): Promise<TarefaLinha[]> {
  if (linhas.length === 0) return []
  const etapas = await db
    .select()
    .from(tarefaEtapas)
    .where(
      inArray(
        tarefaEtapas.tarefaId,
        linhas.map((linha) => linha.id),
      ),
    )
    .orderBy(asc(tarefaEtapas.ordem))

  const porTarefa = new Map<number, EtapaLinha[]>()
  for (const etapa of etapas) {
    const lista = porTarefa.get(etapa.tarefaId) ?? []
    lista.push({
      id: etapa.id,
      ordem: etapa.ordem,
      titulo: etapa.titulo,
      feita: booleano(etapa.feita),
    })
    porTarefa.set(etapa.tarefaId, lista)
  }

  return linhas.map((linha) => ({
    ...linha,
    prioridade: linha.prioridade,
    etapas: porTarefa.get(linha.id) ?? [],
  }))
}

export async function listarTarefas(status: "aberta" | "feita") {
  const linhas = await db.select().from(tarefas).where(eq(tarefas.status, status))
  const ordenadas = [...linhas].sort((a, b) => {
    if (status === "feita") {
      return (b.concluidaEm?.getTime() ?? 0) - (a.concluidaEm?.getTime() ?? 0)
    }
    if (!a.venceEm && !b.venceEm) return b.criadaEm.getTime() - a.criadaEm.getTime()
    if (!a.venceEm) return 1
    if (!b.venceEm) return -1
    return a.venceEm.getTime() - b.venceEm.getTime()
  })
  return anexarEtapas(ordenadas)
}

export async function buscarHistorico(filtro: { q?: string; prioridade?: string; data?: string }) {
  const condicoes = [inArray(tarefas.status, ["feita", "apagada"])]
  if (filtro.prioridade === "normal" || filtro.prioridade === "importante" || filtro.prioridade === "urgente") {
    condicoes.push(eq(tarefas.prioridade, filtro.prioridade))
  }
  if (filtro.data && /^\d{4}-\d{2}-\d{2}$/.test(filtro.data)) {
    const dia = diaDaChave(filtro.data)
    condicoes.push(gte(tarefas.venceEm, inicioDoDia(dia)), lt(tarefas.venceEm, fimDoDia(dia)))
  }
  const termo = (filtro.q ?? "").trim().replace(/[%_]/g, "")
  if (termo) {
    const alvo = `%${termo}%`
    const etapasAchadas = await db
      .select({ tarefaId: tarefaEtapas.tarefaId })
      .from(tarefaEtapas)
      .where(like(tarefaEtapas.titulo, alvo))
    const ids = [...new Set(etapasAchadas.map((linha) => linha.tarefaId))]
    condicoes.push(
      or(
        like(tarefas.titulo, alvo),
        like(tarefas.notas, alvo),
        ids.length > 0 ? inArray(tarefas.id, ids) : eq(tarefas.id, -1),
      )!,
    )
  }
  const linhas = await db
    .select()
    .from(tarefas)
    .where(and(...condicoes))
    .orderBy(desc(tarefas.atualizadaEm))
  return anexarEtapas(linhas)
}

export async function listarCompromissosEntre(inicio: Date, fim: Date) {
  const linhas = await db
    .select()
    .from(compromissos)
    .where(and(ne(compromissos.status, "cancelado"), ne(compromissos.status, "apagada")))
  const excecoes = await excecoesPorCompromisso()
  const ocorrencias: Array<(typeof linhas)[number] & { serieComecaEm: Date }> = []
  for (const linha of linhas) {
    const repeticao = linha.repeticao && repeticaoValida(linha.repeticao) ? linha.repeticao : "nenhuma"
    const pulos = excecoes.get(linha.id) ?? new Set<string>()
    if (linha.status === "feito" || repeticao === "nenhuma") {
      if (
        linha.comecaEm >= inicio &&
        linha.comecaEm < fim &&
        !pulos.has(chaveDia(linha.comecaEm))
      ) {
        ocorrencias.push({ ...linha, serieComecaEm: linha.comecaEm })
      }
      continue
    }
    for (const quando of ocorrenciasEntre(linha.comecaEm, repeticao, linha.repeteAte, inicio, fim, pulos)) {
      ocorrencias.push({ ...linha, serieComecaEm: linha.comecaEm, comecaEm: quando })
    }
  }
  return ocorrencias.sort((a, b) => a.comecaEm.getTime() - b.comecaEm.getTime())
}

export async function excecoesPorCompromisso() {
  const linhas = await db.select().from(compromissoExcecoes)
  const mapa = new Map<number, Set<string>>()
  for (const linha of linhas) {
    const conjunto = mapa.get(linha.compromissoId) ?? new Set<string>()
    conjunto.add(linha.dia)
    mapa.set(linha.compromissoId, conjunto)
  }
  return mapa
}

export async function lerAjustes() {
  const [linha] = await db.select().from(alertSettings).limit(1)
  if (!linha) throw new Error("Ajustes de aviso não encontrados")
  return { ...linha, som: booleano(linha.som) }
}

export async function listarAbertosParaAvisos() {
  const tarefasAbertas = await db
    .select()
    .from(tarefas)
    .where(eq(tarefas.status, "aberta"))
  const horarios = await db
    .select()
    .from(compromissos)
    .where(and(eq(compromissos.status, "marcado")))
  return { tarefas: tarefasAbertas, compromissos: horarios }
}

export async function ultimaNotificacao(
  alvoTipo: "tarefa" | "compromisso",
  alvoId: number,
  tipo: "urgente" | "prazo",
  marcoMinutos: number | null,
) {
  const linhas = await db
    .select()
    .from(notificacoes)
    .where(
      and(
        eq(notificacoes.alvoTipo, alvoTipo),
        eq(notificacoes.alvoId, alvoId),
        eq(notificacoes.tipo, tipo),
      ),
    )
    .orderBy(desc(notificacoes.disparadaEm))
    .limit(8)

  return (
    linhas.find((linha) => (linha.marcoMinutos ?? null) === marcoMinutos) ?? null
  )
}

export async function listarAvisosVisiveis(agora = new Date()): Promise<{
  som: boolean
  avisos: AvisoVisivel[]
}> {
  const ajustes = await lerAjustes()
  const offsets = antecedencias(ajustes.antecedenciasMinutos)
  const abertas = await listarAbertosParaAvisos()
  const recentes = await db
    .select()
    .from(notificacoes)
    .orderBy(desc(notificacoes.disparadaEm))
    .limit(200)

  const avisos: AvisoVisivel[] = []

  for (const tarefa of abertas.tarefas) {
    if (tarefa.silencioAte && tarefa.silencioAte > agora) continue
    if (tarefa.prioridade === "urgente") {
      const aviso = avisoDaLista(recentes, "tarefa", tarefa.id, "urgente", null)
      if (aviso) {
        avisos.push({
          tipo: "urgente",
          alvoTipo: "tarefa",
          alvoId: tarefa.id,
          titulo: tarefa.titulo,
          quando: textoQuando(tarefa.venceEm?.toISOString() ?? null, agora),
          data: dataDoAviso(tarefa.venceEm),
          hora: horaDoAviso(tarefa.venceEm),
        })
      }
    }
    if (!tarefa.venceEm) continue
    const marco = marcoAtual(tarefa.venceEm, agora, offsets)
    if (marco === null || tarefa.prioridade === "urgente") continue
    const aviso = avisoDaLista(recentes, "tarefa", tarefa.id, "prazo", marco)
    if (!aviso) continue
    avisos.push({
      tipo: "prazo",
      alvoTipo: "tarefa",
      alvoId: tarefa.id,
      titulo: tarefa.titulo,
      quando: textoQuando(tarefa.venceEm.toISOString(), agora),
      data: dataDoAviso(tarefa.venceEm),
      hora: horaDoAviso(tarefa.venceEm),
    })
  }

  const excecoes = await excecoesPorCompromisso()
  for (const horario of abertas.compromissos) {
    if (horario.silencioAte && horario.silencioAte > agora) continue
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
    const aviso = avisoDaLista(recentes, "compromisso", horario.id, "prazo", marco)
    if (!aviso) continue
    avisos.push({
      tipo: "prazo",
      alvoTipo: "compromisso",
      alvoId: horario.id,
      titulo: horario.titulo,
      quando: textoQuando(quando.toISOString(), agora),
      data: dataDoAviso(quando),
      hora: horaDoAviso(quando),
    })
  }

  return { som: ajustes.som, avisos }
}

function avisoDaLista(
  recentes: Array<{
    alvoTipo: "tarefa" | "compromisso"
    alvoId: number
    tipo: "urgente" | "prazo"
    marcoMinutos: number | null
    acusadaEm: Date | null
  }>,
  alvoTipo: "tarefa" | "compromisso",
  alvoId: number,
  tipo: "urgente" | "prazo",
  marco: number | null,
) {
  const ultima = recentes.find(
    (linha) =>
      linha.alvoTipo === alvoTipo &&
      linha.alvoId === alvoId &&
      linha.tipo === tipo &&
      (linha.marcoMinutos ?? null) === marco,
  )
  return Boolean(ultima && !ultima.acusadaEm)
}

function horaDoAviso(data: Date | null) {
  if (!data) return "AGORA"
  return horaCurta(data)
}

function dataDoAviso(data: Date | null) {
  if (!data) return "Sem data"
  return dataCurta(data)
}

export async function acusarAviso(
  alvoTipo: "tarefa" | "compromisso",
  alvoId: number,
  tipo: "urgente" | "prazo",
) {
  await db
    .update(notificacoes)
    .set({ acusadaEm: new Date() })
    .where(
      and(
        eq(notificacoes.alvoTipo, alvoTipo),
        eq(notificacoes.alvoId, alvoId),
        eq(notificacoes.tipo, tipo),
        isNull(notificacoes.acusadaEm),
      ),
    )
}

export async function adiarAlvo(
  alvoTipo: "tarefa" | "compromisso",
  alvoId: number,
  minutos: number,
) {
  const silencioAte = new Date(Date.now() + minutos * 60_000)
  const agora = new Date()
  if (alvoTipo === "tarefa") {
    await db
      .update(tarefas)
      .set({ silencioAte, atualizadaEm: agora })
      .where(eq(tarefas.id, alvoId))
    return
  }
  await db
    .update(compromissos)
    .set({ silencioAte, atualizadaEm: agora })
    .where(eq(compromissos.id, alvoId))
}

export async function listarInscricoes() {
  return db.select().from(pushSubscriptions)
}

export async function gravarInscricao(entrada: {
  endpoint: string
  p256dh: string
  auth: string
}) {
  await db
    .insert(pushSubscriptions)
    .values({ ...entrada, criadaEm: new Date() })
    .onDuplicateKeyUpdate({
      set: { p256dh: entrada.p256dh, auth: entrada.auth },
    })
}

export async function removerInscricao(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
}
