import { ColunaDia } from "@/modules/agenda/coluna-dia"
import { GradeAno, GradeMes, GradeSemana } from "@/modules/agenda/grades"
import { listarCompromissosEntre, listarTarefas, lerAjustes } from "@/modules/agenda/consultas"
import { verCompromisso, verTarefa } from "@/modules/agenda/mapear"
import { NavegacaoAgenda } from "@/modules/agenda/navegacao-agenda"
import {
  chaveDia,
  diaDaChave,
  intervaloVista,
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
  const ajustes = await lerAjustes()
  const tarefas = (await listarTarefas("aberta")).map(verTarefa)
  const horarios = marcarConflitos(
    (await listarCompromissosEntre(inicio, fim)).map(verCompromisso),
  )
  const inicioSemana = intervaloVista(dia, "semana")[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NavegacaoAgenda data={chave} vista={vista} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {vista === "dia" ? (
          <ColunaDia
            compromissos={horarios}
            tarefas={tarefas}
            data={chave}
            preencher
            expedienteInicio={ajustes.expedienteInicio}
            expedienteFim={ajustes.expedienteFim}
          />
        ) : null}
        {vista === "semana" ? (
          <GradeSemana
            inicio={inicioSemana}
            itens={horarios}
            ancora={chave}
            tarefas={tarefas}
            expedienteInicio={ajustes.expedienteInicio}
            expedienteFim={ajustes.expedienteFim}
          />
        ) : null}
        {vista === "mes" ? (
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <GradeMes dia={dia} itens={horarios} />
          </div>
        ) : null}
        {vista === "ano" ? (
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <GradeAno dia={dia} itens={horarios} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
