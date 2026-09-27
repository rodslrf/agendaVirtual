export const UNIDADES = ["minuto", "hora", "dia", "semana"] as const

export type UnidadeDuracao = (typeof UNIDADES)[number]

export const ROTULO_UNIDADE: Record<UnidadeDuracao, string> = {
  minuto: "Minutos",
  hora: "Horas",
  dia: "Dias",
  semana: "Semanas",
}

const FATOR: Record<UnidadeDuracao, number> = {
  minuto: 1,
  hora: 60,
  dia: 24 * 60,
  semana: 7 * 24 * 60,
}

export function unidadeValida(valor: string): valor is UnidadeDuracao {
  return (UNIDADES as readonly string[]).includes(valor)
}

export function minutosDe(valor: number, unidade: UnidadeDuracao) {
  return Math.round(valor * FATOR[unidade])
}

export function converterUnidade(valor: number, de: UnidadeDuracao, para: UnidadeDuracao) {
  const minutos = minutosDe(valor, de)
  const convertido = minutos / FATOR[para]
  return Math.max(1, Math.round(convertido))
}

export function textoDuracao(valor: number, unidade: UnidadeDuracao) {
  const nome = ROTULO_UNIDADE[unidade].toLowerCase()
  return `${valor} ${valor === 1 ? nome.replace(/s$/, "") : nome}`
}
