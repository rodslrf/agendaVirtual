import { chaveDia, inicioDoDia, instanteCuiaba, partesCuiaba, somarDias } from "@/modules/agenda/tempo"

export const REPETICOES = [
  "nenhuma",
  "diaria",
  "cada_15_dias",
  "semanal",
  "mensal",
  "anual",
] as const

export type Repeticao = (typeof REPETICOES)[number]

export const ROTULO_REPETICAO: Record<Repeticao, string> = {
  nenhuma: "Não repete",
  diaria: "Todo dia",
  cada_15_dias: "A cada 15 dias",
  semanal: "Toda semana",
  mensal: "Todo mês",
  anual: "Todo ano",
}

export function repeticaoValida(valor: string): valor is Repeticao {
  return (REPETICOES as readonly string[]).includes(valor)
}

function diaCivil(data: Date) {
  const parte = partesCuiaba(inicioDoDia(data))
  return Math.floor(Date.UTC(parte.ano, parte.mes - 1, parte.dia) / 86_400_000)
}

function diaDaSemana(parte: { ano: number; mes: number; dia: number }) {
  return new Date(Date.UTC(parte.ano, parte.mes - 1, parte.dia)).getUTCDay()
}

export function ocorreNoDia(inicio: Date, repeticao: Repeticao, ate: Date | null, dia: Date) {
  const base = partesCuiaba(inicio)
  const alvo = partesCuiaba(inicioDoDia(dia))
  const quando = instanteCuiaba(alvo.ano, alvo.mes, alvo.dia, base.hora, base.minuto)
  if (diaCivil(quando) < diaCivil(inicio)) return null
  // Data "até" anterior ao começo não corta a série. Era um prazo impossível.
  if (ate && diaCivil(ate) >= diaCivil(inicio) && diaCivil(quando) > diaCivil(ate)) return null
  if (repeticao === "nenhuma") return diaCivil(quando) === diaCivil(inicio) ? quando : null
  if (repeticao === "diaria") return quando
  if (repeticao === "cada_15_dias") {
    return (diaCivil(quando) - diaCivil(inicio)) % 15 === 0 ? quando : null
  }
  if (repeticao === "semanal") return diaDaSemana(alvo) === diaDaSemana(base) ? quando : null
  if (repeticao === "mensal") return alvo.dia === base.dia ? quando : null
  if (alvo.mes !== base.mes || alvo.dia !== base.dia) return null
  return quando
}

export function ocorrenciasEntre(
  inicio: Date,
  repeticao: Repeticao,
  ate: Date | null,
  de: Date,
  fim: Date,
  excecoes: Set<string> = new Set(),
) {
  const lista: Date[] = []
  let cursor = inicioDoDia(de)
  const limite = inicioDoDia(new Date(fim.getTime() - 1))
  while (cursor.getTime() <= limite.getTime()) {
    const ocorrencia = ocorreNoDia(inicio, repeticao, ate, cursor)
    if (
      ocorrencia &&
      ocorrencia >= de &&
      ocorrencia < fim &&
      !excecoes.has(chaveDia(ocorrencia))
    ) {
      lista.push(ocorrencia)
    }
    cursor = somarDias(cursor, 1)
  }
  return lista
}

export function ocorrenciaParaAviso(
  inicio: Date,
  repeticao: Repeticao,
  ate: Date | null,
  agora: Date,
  excecoes: Set<string> = new Set(),
) {
  const janelaAtrasMs = 12 * 60 * 60 * 1000
  if (repeticao === "nenhuma") {
    if (excecoes.has(chaveDia(inicio))) return null
    if (inicio.getTime() + janelaAtrasMs < agora.getTime()) return null
    return inicio
  }

  const hoje = ocorreNoDia(inicio, repeticao, ate, agora)
  const hojeVale = hoje && !excecoes.has(chaveDia(hoje)) ? hoje : null
  if (hojeVale && agora.getTime() - hojeVale.getTime() < janelaAtrasMs) return hojeVale

  // Avança pelo passo da série em vez de varrer 370 dias com Intl.
  const passo =
    repeticao === "diaria" ? 1 : repeticao === "cada_15_dias" ? 15 : repeticao === "semanal" ? 7 : 1
  const limiteDias = repeticao === "anual" ? 370 : repeticao === "mensal" ? 62 : 21
  for (let indice = 0; indice <= limiteDias; indice += passo) {
    const dia = somarDias(agora, indice)
    const ocorrencia = ocorreNoDia(inicio, repeticao, ate, dia)
    if (!ocorrencia || excecoes.has(chaveDia(ocorrencia))) continue
    if (hojeVale && ocorrencia.getTime() === hojeVale.getTime()) continue
    if (ocorrencia.getTime() + janelaAtrasMs < agora.getTime()) continue
    return ocorrencia
  }
  return null
}
