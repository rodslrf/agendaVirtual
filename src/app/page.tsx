import { BotoesNovos } from "@/modules/agenda/botoes-novos"
import { CartaoTarefa } from "@/modules/agenda/cartao-tarefa"
import { ColunaDia } from "@/modules/agenda/coluna-dia"
import { listarCompromissosEntre, listarTarefas, lerAjustes } from "@/modules/agenda/consultas"
import { verCompromisso, verTarefa } from "@/modules/agenda/mapear"
import { fimDoDia, inicioDoDia, tituloDia } from "@/modules/agenda/tempo"
import { marcarConflitos } from "@/modules/agenda/vistas"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export const dynamic = "force-dynamic"

export default async function Hoje() {
  const agora = new Date()
  const ajustes = await lerAjustes()
  const tarefas = (await listarTarefas("aberta")).map(verTarefa)
  const horarios = marcarConflitos(
    (await listarCompromissosEntre(inicioDoDia(agora), fimDoDia(agora))).map(verCompromisso),
  )
  const atrasadas = tarefas.filter((tarefa) => tarefa.venceEm && new Date(tarefa.venceEm) < agora)
  const doDia = tarefas.filter((tarefa) => {
    if (!tarefa.venceEm) return false
    const quando = new Date(tarefa.venceEm)
    return quando >= agora && quando < fimDoDia(agora)
  })

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tituloDia(agora)}</h1>
          <p className="text-muted-foreground">O que vence hoje e os horários marcados.</p>
        </div>
        <BotoesNovos data={dataLocal(agora)} />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <Secao titulo="Atrasadas">
            {atrasadas.length === 0 ? (
              <Vazio titulo="Nada atrasado" texto="As tarefas que passaram da hora aparecem aqui." />
            ) : (
              atrasadas.map((tarefa) => <CartaoTarefa key={tarefa.id} tarefa={tarefa} />)
            )}
          </Secao>
          <Secao titulo="Hoje">
            {doDia.length === 0 ? (
              <Vazio titulo="O dia está livre de tarefas" texto="O que vence hoje, e ainda não passou, fica nesta lista." />
            ) : (
              doDia.map((tarefa) => <CartaoTarefa key={tarefa.id} tarefa={tarefa} />)
            )}
          </Secao>
        </div>
        <Secao titulo="Horários">
          <ColunaDia
            compromissos={horarios}
            tarefas={tarefas}
            data={dataLocal(agora)}
            expedienteInicio={ajustes.expedienteInicio}
            expedienteFim={ajustes.expedienteFim}
          />
        </Secao>
      </div>
    </>
  )
}

function dataLocal(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${data.getFullYear()}-${mes}-${dia}`
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  )
}

function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription>{texto}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
