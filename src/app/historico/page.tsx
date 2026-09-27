import Link from "next/link"
import { CartaoTarefa } from "@/modules/agenda/cartao-tarefa"
import { buscarHistorico } from "@/modules/agenda/consultas"
import { FiltroHistorico } from "@/modules/agenda/filtro-historico"
import { verTarefa } from "@/modules/agenda/mapear"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function Historico({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; prioridade?: string; data?: string }>
}) {
  const filtro = await searchParams
  const q = filtro.q ?? ""
  const prioridade = filtro.prioridade ?? ""
  const data = filtro.data ?? ""
  const tarefas = (await buscarHistorico({ q, prioridade, data })).map(verTarefa)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Histórico</h1>
        <Button variant="outline" className="min-h-11" nativeButton={false} render={<Link href="/lista" />}>
          Lista
        </Button>
      </div>
      <FiltroHistorico q={q} prioridade={prioridade} data={data} />
      {tarefas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nada nesse filtro</EmptyTitle>
            <EmptyDescription>Tarefas concluídas e apagadas aparecem aqui.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa tarefa={tarefa} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
