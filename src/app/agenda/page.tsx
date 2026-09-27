import { BotoesNovos } from "@/modules/agenda/botoes-novos"
import { ColunaDia } from "@/modules/agenda/coluna-dia"
import { GradeAno, GradeMes, GradeSemana } from "@/modules/agenda/grades"
import { listarCompromissosEntre, listarTarefas } from "@/modules/agenda/consultas"
import { verCompromisso, verTarefa } from "@/modules/agenda/mapear"
import { NavegacaoAgenda, SeletorVista } from "@/modules/agenda/navegacao-agenda"
import {
  chaveDia,
  diaDaChave,
  intervaloVista,
  tituloVista,
  vistaValida,
} from "@/modules/agenda/tempo"
import { marcarConflitos } from "@/modules/agenda/vistas"

export const dynamic = "force-dynamic"

export default async function Agenda({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; vista?: string }>
}) {
  const parametros = await searchParams
  const vista = vistaValida(parametros.vista) ? parametros.vista : "dia"
  const chave =
    parametros.data && /^\d{4}-\d{2}-\d{2}$/.test(parametros.data)
      ? parametros.data
      : chaveDia(new Date())
  const dia = diaDaChave(chave)
  const [inicio, fim] = intervaloVista(dia, vista)
  const tarefas = (await listarTarefas("aberta")).map(verTarefa)
  const horarios = marcarConflitos(
    (await listarCompromissosEntre(inicio, fim)).map(verCompromisso),
  )
  const inicioSemana = intervaloVista(dia, "semana")[0]

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{tituloVista(dia, vista)}</h1>
        <SeletorVista vista={vista} data={chave} />
        <NavegacaoAgenda data={chave} vista={vista} />
        <BotoesNovos data={chave} />
      </div>
      {vista === "dia" ? (
        <ColunaDia compromissos={horarios} tarefas={tarefas} data={chave} />
      ) : null}
      {vista === "semana" ? <GradeSemana inicio={inicioSemana} itens={horarios} /> : null}
      {vista === "mes" ? <GradeMes dia={dia} itens={horarios} /> : null}
      {vista === "ano" ? <GradeAno dia={dia} itens={horarios} /> : null}
    </>
  )
}
