import { AtivarAvisos } from "@/modules/agenda/ativar-avisos"
import { lerAjustes } from "@/modules/agenda/consultas"
import { FormularioAjustes } from "@/modules/agenda/formulario-ajustes"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function Ajustes() {
  const ajustes = await lerAjustes()
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
        <Button render={<Link href="/prontas" />} nativeButton={false} variant="outline" className="min-h-11">
          Tarefas prontas
        </Button>
      </div>
      <FormularioAjustes
        antecedenciasMinutos={ajustes.antecedenciasMinutos}
        urgenteRepetirMinutos={ajustes.urgenteRepetirMinutos}
        aproximacaoRepetirMinutos={ajustes.aproximacaoRepetirMinutos}
        som={ajustes.som}
        expedienteInicio={ajustes.expedienteInicio}
        expedienteFim={ajustes.expedienteFim}
      />
      <AtivarAvisos />
    </>
  )
}
