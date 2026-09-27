export type EtapaView = {
  id: number
  ordem: number
  titulo: string
  feita: boolean
}

export type TarefaView = {
  id: number
  titulo: string
  notas: string | null
  status: "aberta" | "feita" | "apagada"
  prioridade: "normal" | "importante" | "urgente"
  venceEm: string | null
  etapas: EtapaView[]
}

export type RepeticaoView = "nenhuma" | "diaria" | "cada_15_dias" | "semanal" | "mensal" | "anual"

export type CompromissoView = {
  id: number
  titulo: string
  notas: string | null
  comecaEm: string
  serieComecaEm: string
  duracaoMinutos: number
  duracaoValor: number
  duracaoUnidade: "minuto" | "hora" | "dia" | "semana"
  status: "marcado" | "feito" | "cancelado" | "apagada"
  repeticao: RepeticaoView
  repeteAte: string | null
  conflito: boolean
}

export type AvisoVisivel = {
  tipo: "urgente" | "prazo"
  alvoTipo: "tarefa" | "compromisso"
  alvoId: number
  titulo: string
  quando: string
  data: string
  hora: string
}

export function marcarConflitos(
  itens: Array<Omit<CompromissoView, "conflito">>,
): CompromissoView[] {
  const ativos = itens.filter((item) => item.status === "marcado")
  const chaves = new Set<string>()
  for (let i = 0; i < ativos.length; i += 1) {
    const inicioA = new Date(ativos[i].comecaEm).getTime()
    const fimA = inicioA + ativos[i].duracaoMinutos * 60_000
    for (let j = i + 1; j < ativos.length; j += 1) {
      const inicioB = new Date(ativos[j].comecaEm).getTime()
      const fimB = inicioB + ativos[j].duracaoMinutos * 60_000
      if (inicioA < fimB && inicioB < fimA) {
        chaves.add(`${ativos[i].id}-${ativos[i].comecaEm}`)
        chaves.add(`${ativos[j].id}-${ativos[j].comecaEm}`)
      }
    }
  }
  return itens.map((item) => ({
    ...item,
    conflito: chaves.has(`${item.id}-${item.comecaEm}`),
  }))
}
