import Link from "next/link"
import { CartaoTarefa } from "@/modules/agenda/cartao-tarefa"
import { listarTarefas } from "@/modules/agenda/consultas"
import { verTarefa } from "@/modules/agenda/mapear"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export const dynamic = "force-dynamic"

export default async function Prontas() {
  const tarefas = (await listarTarefas("feita")).map(verTarefa)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Prontas</h1>
        <Button render={<Link href="/lista" />} nativeButton={false} variant="outline" className="min-h-11">
          Voltar à lista
        </Button>
      </div>
      {tarefas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nada concluído ainda</EmptyTitle>
            <EmptyDescription>Quando uma tarefa for concluída, ela fica aqui e pode ser reaberta.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {tarefas.map((tarefa) => (
            <CartaoTarefa key={tarefa.id} tarefa={tarefa} />
          ))}
        </div>
      )}
    </>
  )
}
