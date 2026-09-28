"use server"

import { and, asc, eq, gt } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { compromissos, compromissoExcecoes, tarefaEtapas, tarefas, alertSettings } from "@/server/db/schema"
import { chaveDia, combinarDataHora, somarDias } from "@/modules/agenda/tempo"
import { ocorrenciasEntre, repeticaoValida } from "@/modules/agenda/repeticao"
import { minutosDe, unidadeValida, type UnidadeDuracao } from "@/modules/agenda/duracao"
import { listarCompromissosEntre } from "@/modules/agenda/consultas"

const ADIAR = [15, 60]

function atualizarTelas() {
  revalidatePath("/", "layout")
}

function tituloValido(titulo: string) {
  const limpo = titulo.trim()
  if (limpo.length < 1 || limpo.length > 200) return null
  return limpo
}

function notasLimpas(notas: string) {
  const limpo = notas.trim()
  return limpo.length > 0 ? limpo.slice(0, 2000) : null
}

export async function salvarTarefa(entrada: {
  id?: number
  titulo: string
  notas: string
  data: string
  hora: string
  etapas: number
  prioridade: "normal" | "importante" | "urgente"
}) {
  const titulo = tituloValido(entrada.titulo)
  if (!titulo) return { erro: "Dê um nome para a tarefa." }
  const quantidade = Math.round(entrada.etapas)
  if (quantidade < 1 || quantidade > 12) return { erro: "A tarefa tem de 1 a 12 etapas." }
  const venceEm =
    entrada.data || entrada.hora ? combinarDataHora(entrada.data, entrada.hora) : null
  if ((entrada.data || entrada.hora) && !venceEm) return { erro: "Data ou hora inválida." }

  const agora = new Date()
  const notas = notasLimpas(entrada.notas)

  if (!entrada.id) {
    const inserida = await db.insert(tarefas).values({
      titulo,
      notas,
      prioridade: entrada.prioridade,
      venceEm,
      criadaEm: agora,
      atualizadaEm: agora,
    })
    const tarefaId = Number(inserida[0].insertId)
    await criarEtapas(tarefaId, quantidade)
    atualizarTelas()
    return { ok: true }
  }

  await db
    .update(tarefas)
    .set({
      titulo,
      notas,
      prioridade: entrada.prioridade,
      venceEm,
      atualizadaEm: agora,
    })
    .where(eq(tarefas.id, entrada.id))
  await ajustarQuantidadeDeEtapas(entrada.id, quantidade)
  atualizarTelas()
  return { ok: true }
}

async function criarEtapas(tarefaId: number, quantidade: number) {
  if (quantidade === 0) return
  await db.insert(tarefaEtapas).values(
    Array.from({ length: quantidade }, (_, indice) => ({
      tarefaId,
      ordem: indice + 1,
      titulo: `Etapa ${indice + 1}`,
      feita: false,
    })),
  )
}

async function ajustarQuantidadeDeEtapas(tarefaId: number, quantidade: number) {
  const atuais = await db
    .select()
    .from(tarefaEtapas)
    .where(eq(tarefaEtapas.tarefaId, tarefaId))
    .orderBy(asc(tarefaEtapas.ordem))

  if (quantidade > atuais.length) {
    await db.insert(tarefaEtapas).values(
      Array.from({ length: quantidade - atuais.length }, (_, indice) => ({
        tarefaId,
        ordem: atuais.length + indice + 1,
        titulo: `Etapa ${atuais.length + indice + 1}`,
        feita: false,
      })),
    )
  }

  if (quantidade < atuais.length) {
    await db
      .delete(tarefaEtapas)
      .where(and(eq(tarefaEtapas.tarefaId, tarefaId), gt(tarefaEtapas.ordem, quantidade)))
  }
}

export async function renomearEtapa(id: number, titulo: string) {
  const limpo = tituloValido(titulo)
  if (!limpo) return { erro: "A etapa precisa de um nome." }
  await db.update(tarefaEtapas).set({ titulo: limpo }).where(eq(tarefaEtapas.id, id))
  atualizarTelas()
  return { ok: true }
}

export async function alternarEtapa(id: number, feita: boolean) {
  await db.update(tarefaEtapas).set({ feita }).where(eq(tarefaEtapas.id, id))
  atualizarTelas()
  return { ok: true }
}

export async function concluirTarefa(id: number) {
  const agora = new Date()
  await db
    .update(tarefas)
    .set({ status: "feita", concluidaEm: agora, atualizadaEm: agora })
    .where(eq(tarefas.id, id))
  atualizarTelas()
}

export async function reabrirTarefa(id: number) {
  await db
    .update(tarefas)
    .set({
      status: "aberta",
      concluidaEm: null,
      silencioAte: null,
      atualizadaEm: new Date(),
    })
    .where(eq(tarefas.id, id))
  atualizarTelas()
}

export async function apagarTarefa(id: number) {
  await db
    .update(tarefas)
    .set({ status: "apagada", atualizadaEm: new Date() })
    .where(eq(tarefas.id, id))
  atualizarTelas()
}

export async function salvarCompromisso(entrada: {
  id?: number
  titulo: string
  notas: string
  data: string
  hora: string
  duracaoValor: number
  duracaoUnidade: string
  repeticao: string
  repeteAte: string
}) {
  const titulo = tituloValido(entrada.titulo)
  if (!titulo) return { erro: "Diga quem é ou qual é o assunto." }
  if (!unidadeValida(entrada.duracaoUnidade)) return { erro: "Escolha minutos, horas, dias ou semanas." }
  const duracao = minutosDe(entrada.duracaoValor, entrada.duracaoUnidade)
  if (duracao < 5 || duracao > 8 * 7 * 24 * 60) return { erro: "A duração fica entre 5 minutos e 8 semanas." }
  const comecaEm = combinarDataHora(entrada.data, entrada.hora)
  if (!comecaEm || !entrada.hora) return { erro: "O horário precisa de dia e hora." }
  if (!repeticaoValida(entrada.repeticao)) return { erro: "Escolha se o horário repete." }
  const repeteAte =
    entrada.repeticao === "nenhuma" || !entrada.repeteAte
      ? null
      : combinarDataHora(entrada.repeteAte, entrada.hora)
  if (entrada.repeticao !== "nenhuma" && entrada.repeteAte && !repeteAte) {
    return { erro: "A data final da repetição é inválida." }
  }

  const agora = new Date()
  const valores = {
    titulo,
    notas: notasLimpas(entrada.notas),
    comecaEm,
    duracaoMinutos: duracao,
    duracaoValor: Math.round(entrada.duracaoValor),
    duracaoUnidade: entrada.duracaoUnidade as UnidadeDuracao,
    repeticao: entrada.repeticao,
    repeteAte,
    atualizadaEm: agora,
  }

  if (!entrada.id) {
    await db.insert(compromissos).values({ ...valores, criadaEm: agora, status: "marcado" })
  } else {
    await db.update(compromissos).set(valores).where(eq(compromissos.id, entrada.id))
  }
  atualizarTelas()
  return { ok: true }
}

export async function moverCompromisso(entrada: {
  id: number
  data: string
  hora: string
  duracaoMinutos: number
}) {
  const duracao = Math.round(entrada.duracaoMinutos)
  if (duracao < 15 || duracao > 8 * 7 * 24 * 60) return { erro: "A duração fica entre 15 minutos e 8 semanas." }
  const comecaEm = combinarDataHora(entrada.data, entrada.hora)
  if (!comecaEm) return { erro: "O horário precisa de dia e hora." }
  const [atual] = await db.select().from(compromissos).where(eq(compromissos.id, entrada.id)).limit(1)
  if (!atual) return { erro: "Esse horário não existe mais." }
  await db
    .update(compromissos)
    .set({
      comecaEm,
      duracaoMinutos: duracao,
      duracaoValor: duracao,
      duracaoUnidade: "minuto",
      atualizadaEm: new Date(),
    })
    .where(eq(compromissos.id, entrada.id))
  atualizarTelas()
  return { ok: true }
}

export async function bloquearTarefa(entrada: { tarefaId: number; data: string; hora: string }) {
  const comecaEm = combinarDataHora(entrada.data, entrada.hora)
  if (!comecaEm) return { erro: "O horário precisa de dia e hora." }
  const [tarefa] = await db.select().from(tarefas).where(eq(tarefas.id, entrada.tarefaId)).limit(1)
  if (!tarefa || tarefa.status !== "aberta") return { erro: "Essa tarefa não está aberta." }
  const agora = new Date()
  await db.insert(compromissos).values({
    titulo: tarefa.titulo,
    notas: tarefa.notas,
    comecaEm,
    duracaoMinutos: 30,
    duracaoValor: 30,
    duracaoUnidade: "minuto",
    status: "marcado",
    tarefaOrigemId: tarefa.id,
    criadaEm: agora,
    atualizadaEm: agora,
  })
  await db
    .update(tarefas)
    .set({ venceEm: comecaEm, atualizadaEm: agora })
    .where(eq(tarefas.id, tarefa.id))
  atualizarTelas()
  return { ok: true }
}

export async function nomesEmConflito(entrada: {
  id?: number
  data: string
  hora: string
  duracaoValor: number
  duracaoUnidade: string
  repeticao: string
  repeteAte: string
}) {
  if (!unidadeValida(entrada.duracaoUnidade) || !repeticaoValida(entrada.repeticao)) return []
  const comecaEm = combinarDataHora(entrada.data, entrada.hora)
  if (!comecaEm) return []
  const minutos = minutosDe(entrada.duracaoValor, entrada.duracaoUnidade)
  if (minutos < 5) return []
  const repeteAte =
    entrada.repeticao === "nenhuma" || !entrada.repeteAte
      ? null
      : combinarDataHora(entrada.repeteAte, entrada.hora)
  const limite = somarDias(repeteAte ?? comecaEm, entrada.repeticao === "nenhuma" ? 1 : 370)
  const meus =
    entrada.repeticao === "nenhuma"
      ? [comecaEm]
      : ocorrenciasEntre(comecaEm, entrada.repeticao, repeteAte, comecaEm, limite)
  if (meus.length === 0) return []
  const ultimo = meus[meus.length - 1]
  const outros = await listarCompromissosEntre(meus[0], new Date(ultimo.getTime() + minutos * 60_000))
  const nomes = new Set<string>()
  for (const meu of meus) {
    const fim = meu.getTime() + minutos * 60_000
    for (const outro of outros) {
      if (entrada.id && outro.id === entrada.id) continue
      const inicioOutro = outro.comecaEm.getTime()
      const fimOutro = inicioOutro + outro.duracaoMinutos * 60_000
      if (meu.getTime() < fimOutro && inicioOutro < fim) nomes.add(outro.titulo)
    }
  }
  return [...nomes]
}

export async function concluirCompromisso(id: number) {
  await db
    .update(compromissos)
    .set({ status: "feito", atualizadaEm: new Date() })
    .where(eq(compromissos.id, id))
  atualizarTelas()
}

export async function reabrirCompromisso(id: number) {
  await db
    .update(compromissos)
    .set({ status: "marcado", silencioAte: null, atualizadaEm: new Date() })
    .where(eq(compromissos.id, id))
  atualizarTelas()
}

export async function cancelarCompromisso(id: number) {
  await db
    .update(compromissos)
    .set({ status: "apagada", atualizadaEm: new Date() })
    .where(eq(compromissos.id, id))
  atualizarTelas()
}

export async function pularOcorrencia(id: number, ocorreEm: string) {
  const dia = chaveDia(new Date(ocorreEm))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return { erro: "Data da ocorrência inválida." }
  await db.insert(compromissoExcecoes).values({ compromissoId: id, dia }).onDuplicateKeyUpdate({
    set: { dia },
  })
  atualizarTelas()
  return { ok: true }
}

function horaValida(valor: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)
}

export async function salvarAjustes(entrada: {
  antecedenciasMinutos: string
  urgenteRepetirMinutos: number
  aproximacaoRepetirMinutos: number
  som: boolean
  expedienteInicio: string
  expedienteFim: string
}) {
  const numeros = entrada.antecedenciasMinutos
    .split(",")
    .map((parte) => Number(parte.trim()))
    .filter((numero) => [15, 60, 120, 1440].includes(numero))
  if (numeros.length === 0) return { erro: "Escolha ao menos um aviso antes do horário." }
  const urgente = Math.round(entrada.urgenteRepetirMinutos)
  const aproximacao = Math.round(entrada.aproximacaoRepetirMinutos)
  if (![15, 30, 60, 120].includes(urgente) || ![15, 30, 60, 120].includes(aproximacao)) {
    return { erro: "Escolha de quanto em quanto tempo o aviso repete." }
  }
  if (!horaValida(entrada.expedienteInicio) || !horaValida(entrada.expedienteFim)) {
    return { erro: "O expediente precisa de hora de início e fim." }
  }

  await db
    .update(alertSettings)
    .set({
      antecedenciasMinutos: numeros.join(","),
      urgenteRepetirMinutos: urgente,
      aproximacaoRepetirMinutos: aproximacao,
      som: entrada.som,
      expedienteInicio: entrada.expedienteInicio,
      expedienteFim: entrada.expedienteFim,
    })
    .where(eq(alertSettings.id, 1))
  atualizarTelas()
  return { ok: true }
}

export async function adiarDaTela(
  alvoTipo: "tarefa" | "compromisso",
  alvoId: number,
  minutos: number,
) {
  if (!ADIAR.includes(minutos)) return { erro: "Adie por 15 minutos ou 1 hora." }
  const { adiarAlvo } = await import("@/modules/agenda/consultas")
  await adiarAlvo(alvoTipo, alvoId, minutos)
  atualizarTelas()
  return { ok: true }
}
