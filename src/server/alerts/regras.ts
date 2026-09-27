import { minutosEntre } from "@/modules/agenda/tempo"

export function antecedencias(texto: string) {
  return texto
    .split(",")
    .map((parte) => Number(parte.trim()))
    .filter((numero) => Number.isFinite(numero) && numero > 0)
}

export function marcoAtual(alvo: Date, agora: Date, offsets: number[]) {
  const minutos = minutosEntre(alvo, agora)
  const ordenados = [...offsets].sort((a, b) => b - a)
  if (ordenados.length === 0) return minutos <= 0 ? 0 : null
  if (minutos > ordenados[0]) return null
  if (minutos <= 0) return 0
  const atingidos = ordenados.filter((offset) => minutos <= offset)
  return Math.min(...atingidos)
}

export function podeRepetir(ultimoDisparo: Date | null, agora: Date, intervaloMinutos: number) {
  if (!ultimoDisparo) return true
  return minutosEntre(agora, ultimoDisparo) >= intervaloMinutos
}
