"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function useDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 768px)")
    const atualizar = () => setDesktop(consulta.matches)
    atualizar()
    consulta.addEventListener("change", atualizar)
    return () => consulta.removeEventListener("change", atualizar)
  }, [])
  return desktop
}

export function Superficie({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
}: {
  aberto: boolean
  aoFechar: (aberto: boolean) => void
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  const desktop = useDesktop()
  if (desktop) {
    return (
      <Dialog open={aberto} onOpenChange={aoFechar}>
        <DialogContent className="top-6 flex max-h-[calc(100dvh-3rem)] translate-y-0 flex-col overflow-hidden p-0 sm:max-w-md">
          <div className="agenda-scroll flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
            <DialogHeader>
              <DialogTitle>{titulo}</DialogTitle>
              <DialogDescription>{descricao}</DialogDescription>
            </DialogHeader>
            {children}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Sheet open={aberto} onOpenChange={aoFechar}>
      <SheetContent
        side="bottom"
        className="data-[side=bottom]:inset-x-3 data-[side=bottom]:bottom-3 data-[side=bottom]:mb-0 max-h-[calc(100dvh-3rem)] gap-0 overflow-hidden rounded-2xl p-0"
      >
        <div className="agenda-scroll flex max-h-[calc(100dvh-3rem)] flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
          <SheetHeader>
            <SheetTitle>{titulo}</SheetTitle>
            <SheetDescription>{descricao}</SheetDescription>
          </SheetHeader>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
