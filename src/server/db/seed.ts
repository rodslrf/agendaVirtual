import { db } from "@/server/db"
import { alertSettings, compromissos, tarefaEtapas, tarefas } from "@/server/db/schema"
import { acrescentarMinutos } from "@/modules/agenda/tempo"

export async function semear() {
  const [ajustes] = await db.select({ id: alertSettings.id }).from(alertSettings).limit(1)
  if (!ajustes) {
    await db.insert(alertSettings).values({
      id: 1,
      antecedenciasMinutos: "1440,120",
      urgenteRepetirMinutos: 30,
      aproximacaoRepetirMinutos: 60,
      som: true,
    })
  }

  const [tarefa] = await db.select({ id: tarefas.id }).from(tarefas).limit(1)
  if (tarefa) return

  const agora = new Date()
  const criada = {
    criadaEm: agora,
    atualizadaEm: agora,
  }

  const urgente = await db.insert(tarefas).values({
    ...criada,
    titulo: "Ligar para a cliente",
    notas: "Confirmar o que entra na agenda desta semana.",
    prioridade: "urgente",
    venceEm: acrescentarMinutos(agora, 90),
  })
  const urgenteId = Number(urgente[0].insertId)
  await db.insert(tarefaEtapas).values([
    { tarefaId: urgenteId, ordem: 1, titulo: "Anotar o que ela pediu", feita: true },
    { tarefaId: urgenteId, ordem: 2, titulo: "Ligar", feita: false },
  ])

  const lista = await db.insert(tarefas).values({
    ...criada,
    titulo: "Separar a lista da semana",
    venceEm: acrescentarMinutos(agora, 60 * 26),
  })
  const listaId = Number(lista[0].insertId)
  await db.insert(tarefaEtapas).values([
    { tarefaId: listaId, ordem: 1, titulo: "Tarefas da casa", feita: false },
    { tarefaId: listaId, ordem: 2, titulo: "Horários marcados", feita: false },
    { tarefaId: listaId, ordem: 3, titulo: "O que pode esperar", feita: false },
  ])

  const inicio = new Date(agora)
  inicio.setHours(agora.getHours() + 2, 0, 0, 0)
  await db.insert(compromissos).values({
    ...criada,
    titulo: "Corte — Ana",
    comecaEm: inicio,
    duracaoMinutos: 45,
    status: "marcado",
  })
}
