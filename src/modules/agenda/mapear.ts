import type { TarefaLinha } from "@/modules/agenda/consultas"
import type { RepeticaoView, TarefaView } from "@/modules/agenda/vistas"
import { chaveDia } from "@/modules/agenda/tempo"
import { repeticaoValida } from "@/modules/agenda/repeticao"

export function verTarefa(tarefa: TarefaLinha): TarefaView {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    notas: tarefa.notas,
    status: tarefa.status,
    prioridade: tarefa.prioridade ?? "normal",
    venceEm: tarefa.venceEm ? tarefa.venceEm.toISOString() : null,
    etapas: tarefa.etapas,
  }
}

export function verCompromisso(item: {
  id: number
  titulo: string
  notas: string | null
  comecaEm: Date
  serieComecaEm?: Date
  duracaoMinutos: number
  duracaoValor?: number
  duracaoUnidade?: "minuto" | "hora" | "dia" | "semana"
  status: "marcado" | "feito" | "cancelado" | "apagada"
  repeticao?: string
  repeteAte?: Date | null
}) {
  const repeticao = item.repeticao && repeticaoValida(item.repeticao) ? item.repeticao : "nenhuma"
  return {
    id: item.id,
    titulo: item.titulo,
    notas: item.notas,
    comecaEm: item.comecaEm.toISOString(),
    serieComecaEm: (item.serieComecaEm ?? item.comecaEm).toISOString(),
    duracaoMinutos: item.duracaoMinutos,
    duracaoValor: item.duracaoValor ?? item.duracaoMinutos,
    duracaoUnidade: item.duracaoUnidade ?? "minuto",
    status: item.status,
    repeticao: repeticao as RepeticaoView,
    repeteAte: item.repeteAte ? item.repeteAte.toISOString() : null,
  }
}

export function chaveDeHoje() {
  return chaveDia(new Date())
}
