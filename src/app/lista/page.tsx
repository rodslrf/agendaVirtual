import Link from "next/link"
import { BotoesNovos } from "@/modules/agenda/botoes-novos"
import { CartaoTarefa } from "@/modules/agenda/cartao-tarefa"
import { listarTarefas } from "@/modules/agenda/consultas"
import { verTarefa } from "@/modules/agenda/mapear"
import { fimDoDia } from "@/modules/agenda/tempo"
import type { TarefaView } from "@/modules/agenda/vistas"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const grupos = [
  { id: "atrasadas", titulo: "Atrasadas" },
  { id: "hoje", titulo: "Hoje" },
  { id: "proximas", titulo: "Próximas" },
  { id: "sem", titulo: "Sem data" },
] as const

export default async function Lista() {
  const agora = new Date()
  const tarefas = (await listarTarefas("aberta")).map(verTarefa)
  const separados = {
    atrasadas: tarefas.filter((tarefa) => tarefa.venceEm && new Date(tarefa.venceEm) < agora),
    hoje: tarefas.filter((tarefa) => {
      if (!tarefa.venceEm) return false
      const quando = new Date(tarefa.venceEm)
      return quando >= agora && quando < fimDoDia(agora)
    }),
    proximas: tarefas.filter((tarefa) => tarefa.venceEm && new Date(tarefa.venceEm) >= fimDoDia(agora)),
    sem: tarefas.filter((tarefa) => !tarefa.venceEm),
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Lista</h1>
        <div className="flex items-center gap-2">
        <Button variant="outline" className="min-h-11" nativeButton={false} render={<Link href="/historico" />}>
            Histórico
          </Button>
          <BotoesNovos />
        </div>
      </div>
      {tarefas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nenhuma tarefa aberta</EmptyTitle>
            <EmptyDescription>Crie a primeira com o botão de cima.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        grupos.map((grupo) => (
          <Grupo key={grupo.id} titulo={grupo.titulo} tarefas={separados[grupo.id]} />
        ))
      )}
    </>
  )
}

function Grupo({ titulo, tarefas }: { titulo: string; tarefas: TarefaView[] }) {
  if (tarefas.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {tarefas.map((tarefa) => (
        <CartaoTarefa key={tarefa.id} tarefa={tarefa} />
      ))}
    </section>
  )
}
