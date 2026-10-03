const MINUTO = 60_000
const FUSO = "America/Cuiaba"
const FUSO_MINUTOS = -4 * 60

// Recriar Intl a cada chamada travava o event loop (avisos/grade).
const formatadorCuiaba = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

export function partesCuiaba(data: Date) {
  const partes = formatadorCuiaba.formatToParts(data)
  const ler = (tipo: Intl.DateTimeFormatPartTypes) =>
    Number(partes.find((parte) => parte.type === tipo)?.value ?? "0")
  const hora = ler("hour")
  return { ano: ler("year"), mes: ler("month"), dia: ler("day"), hora: hora === 24 ? 0 : hora, minuto: ler("minute") }
}

export function instanteCuiaba(ano: number, mes: number, dia: number, hora = 0, minuto = 0) {
  return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto) - FUSO_MINUTOS * MINUTO)
}

export function inicioDoDia(data: Date) {
  const parte = partesCuiaba(data)
  return instanteCuiaba(parte.ano, parte.mes, parte.dia)
}

export function fimDoDia(data: Date) {
  return new Date(inicioDoDia(data).getTime() + 24 * 60 * MINUTO)
}

export function somarDias(data: Date, dias: number) {
  return new Date(inicioDoDia(data).getTime() + dias * 24 * 60 * MINUTO)
}

export function acrescentarMinutos(data: Date, minutos: number) {
  return new Date(data.getTime() + minutos * MINUTO)
}

export function minutosEntre(alvo: Date, agora: Date) {
  return (alvo.getTime() - agora.getTime()) / MINUTO
}

export function chaveDia(data: Date) {
  const parte = partesCuiaba(data)
  return `${parte.ano}-${String(parte.mes).padStart(2, "0")}-${String(parte.dia).padStart(2, "0")}`
}

export function diaDaChave(chave: string) {
  const [ano, mes, dia] = chave.split("-").map(Number)
  if (!ano || !mes || !dia) return inicioDoDia(new Date())
  return instanteCuiaba(ano, mes, dia)
}

/** Dia que o calendário da tela mostra (fuso do navegador, não Cuiabá). */
export function chaveCalendario(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${data.getFullYear()}-${mes}-${dia}`
}

/** Meio-dia local para o DayPicker marcar o mesmo dia civil. */
export function dataDoCalendario(chave: string) {
  const [ano, mes, dia] = chave.split("-").map(Number)
  if (!ano || !mes || !dia) return new Date()
  return new Date(ano, mes - 1, dia, 12, 0, 0)
}

export function horaCurta(data: Date) {
  const parte = partesCuiaba(data)
  return `${String(parte.hora).padStart(2, "0")}:${String(parte.minuto).padStart(2, "0")}`
}

export function dataCurta(data: Date) {
  const parte = partesCuiaba(data)
  return `${String(parte.dia).padStart(2, "0")}/${String(parte.mes).padStart(2, "0")}`
}

export function textoQuando(iso: string | null, agora = new Date()) {
  if (!iso) return "Sem data"
  const data = new Date(iso)
  const hora = horaCurta(data)
  const dia = inicioDoDia(data).getTime()
  const hoje = inicioDoDia(agora).getTime()
  if (dia === hoje) return `Hoje às ${hora}`
  if (dia === hoje + 24 * 60 * MINUTO) return `Amanhã às ${hora}`
  const curta = dataCurta(data)
  return `${curta} às ${hora}`
}

export function combinarDataHora(data: string, hora: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null
  const horario = hora || "09:00"
  if (!/^\d{2}:\d{2}$/.test(horario)) return null
  const [ano, mes, dia] = data.split("-").map(Number)
  const [hh, mm] = horario.split(":").map(Number)
  if (hh > 23 || mm > 59) return null
  return instanteCuiaba(ano, mes, dia, hh, mm)
}

export function partirDataHora(iso: string | null) {
  if (!iso) return { data: "", hora: "" }
  const data = new Date(iso)
  return { data: chaveDia(data), hora: horaCurta(data) }
}

export type VistaAgenda = "dia" | "semana" | "mes" | "ano"

export function vistaValida(valor: string | undefined): valor is VistaAgenda {
  return valor === "dia" || valor === "semana" || valor === "mes" || valor === "ano"
}

export function moverVista(dia: Date, vista: VistaAgenda, direcao: 1 | -1) {
  if (vista === "dia") return somarDias(dia, direcao)
  if (vista === "semana") return somarDias(dia, direcao * 7)
  const parte = partesCuiaba(inicioDoDia(dia))
  if (vista === "mes") return instanteCuiaba(parte.ano, parte.mes + direcao, 1)
  return instanteCuiaba(parte.ano + direcao, 1, 1)
}

function diaDaSemanaCuiaba(data: Date) {
  const parte = partesCuiaba(inicioDoDia(data))
  return new Date(Date.UTC(parte.ano, parte.mes - 1, parte.dia)).getUTCDay()
}

export function intervaloVista(dia: Date, vista: VistaAgenda): [Date, Date] {
  if (vista === "dia") return [inicioDoDia(dia), fimDoDia(dia)]
  if (vista === "semana") {
    const inicio = somarDias(dia, -diaDaSemanaCuiaba(dia))
    return [inicio, somarDias(inicio, 7)]
  }
  const parte = partesCuiaba(inicioDoDia(dia))
  if (vista === "mes") return [instanteCuiaba(parte.ano, parte.mes, 1), instanteCuiaba(parte.ano, parte.mes + 1, 1)]
  return [instanteCuiaba(parte.ano, 1, 1), instanteCuiaba(parte.ano + 1, 1, 1)]
}

export function tituloVista(dia: Date, vista: VistaAgenda) {
  if (vista === "semana") {
    const [inicio, fimExclusivo] = intervaloVista(dia, "semana")
    const fim = somarDias(fimExclusivo, -1)
    const formatar = (data: Date, opcoes: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...opcoes }).format(data)
    const a = partesCuiaba(inicio)
    const b = partesCuiaba(fim)
    if (a.ano === b.ano && a.mes === b.mes) {
      return `${a.dia} – ${formatar(fim, { day: "numeric", month: "long", year: "numeric" })}`
    }
    if (a.ano === b.ano) {
      return `${formatar(inicio, { day: "numeric", month: "long" })} – ${formatar(fim, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    }
    return `${formatar(inicio, { day: "numeric", month: "long", year: "numeric" })} – ${formatar(fim, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`
  }
  if (vista === "dia") return tituloDia(dia)
  if (vista === "mes") {
    const texto = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Cuiaba",
      month: "long",
      year: "numeric",
    }).format(dia)
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  }
  const parte = partesCuiaba(dia)
  return String(parte.ano)
}

export function tituloDia(data: Date) {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Cuiaba",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(data)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
