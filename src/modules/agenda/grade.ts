export const SNAP_MINUTOS = 15
export const DURACAO_CLIQUE_MINUTOS = 30
export const DURACAO_TAREFA_MINUTOS = 30
export const LIMIAR_ARRASTE_PX = 8
export const ALTURA_HORA = 60
export const ORDEM_HORAS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

const MINUTOS_GRADE = ORDEM_HORAS.length * 60

export function encaixarMinutos(valor: number) {
  const encaixado = Math.round(valor / SNAP_MINUTOS) * SNAP_MINUTOS
  return Math.max(0, Math.min(MINUTOS_GRADE - SNAP_MINUTOS, encaixado))
}

export function minutosNoPonto(clientY: number, topoColuna: number, alturaHora = ALTURA_HORA) {
  const minutos = ((clientY - topoColuna) / alturaHora) * 60
  return encaixarMinutos(minutos)
}

export function minutosDoHorario(hora: number, minuto: number) {
  const indice = ORDEM_HORAS.indexOf(hora)
  return (indice < 0 ? 0 : indice) * 60 + minuto
}

export function horarioDoMinuto(minutosDesdeInicio: number) {
  const limitado = Math.max(0, Math.min(MINUTOS_GRADE - SNAP_MINUTOS, minutosDesdeInicio))
  const indice = Math.min(ORDEM_HORAS.length - 1, Math.floor(limitado / 60))
  const hora = ORDEM_HORAS[indice] ?? 5
  const minuto = limitado - indice * 60
  return {
    hora,
    minuto,
    texto: `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`,
  }
}

export function textoHorario(hora: string) {
  return /^\d{2}:\d{2}$/.test(hora) ? hora : "08:00"
}

export function minutosDoTexto(hora: string) {
  const [hh, mm] = textoHorario(hora).split(":").map(Number)
  return minutosDoHorario(hh ?? 0, mm ?? 0)
}

export function horaForaDoExpediente(hora: number, inicio: string, fim: string) {
  const agora = minutosDoHorario(hora, 0)
  return agora < minutosDoTexto(inicio) || agora >= minutosDoTexto(fim)
}

export function duracaoDaFaixa(inicioMin: number, fimMin: number) {
  const a = Math.min(inicioMin, fimMin)
  const b = Math.max(inicioMin, fimMin)
  return { inicio: a, duracao: Math.max(SNAP_MINUTOS, b - a) }
}
