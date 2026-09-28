"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useState, useSyncExternalStore } from "react"
import { CalendarDaysIcon, ListChecksIcon, MenuIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react"
import { modulos } from "@/config/modulos"
import { PainelAviso } from "@/components/painel-aviso"
import { SidebarAgenda } from "@/components/sidebar-agenda"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "cn"
import type { TarefaView } from "@/modules/agenda/vistas"

const icones = {
  "/": SunIcon,
  "/lista": ListChecksIcon,
  "/agenda": CalendarDaysIcon,
} as const

export function Casca({
  children,
  temaEscuro = false,
  tarefas = [],
}: {
  children: React.ReactNode
  temaEscuro?: boolean
  tarefas?: TarefaView[]
}) {
  const caminho = usePathname()
  const itens = modulos[0].itens
  const naAgenda = caminho === "/agenda"
  const [menu, setMenu] = useState(false)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3 text-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setMenu(true)}
        >
          <MenuIcon />
        </Button>
        <p className="min-w-0 truncate text-[20px] font-semibold tracking-tight text-foreground">{modulos[0].nome}</p>
        <div className="ml-auto flex items-center gap-1">
          <InterruptorTema inicial={temaEscuro} />
          <Button
            render={<Link href="/ajustes" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            aria-label="Ajustes"
          >
            <SettingsIcon />
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 overflow-hidden border-r border-border bg-sidebar lg:block">
          <Suspense fallback={null}>
            <SidebarAgenda tarefas={tarefas} />
          </Suspense>
        </aside>
        <main
          className={cn(
            "min-h-0 min-w-0 flex-1",
            naAgenda ? "flex flex-col overflow-hidden" : "overflow-auto px-4 py-6 pb-24 lg:pb-8",
          )}
        >
          {naAgenda ? children : <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background lg:hidden">
        {itens.map((item) => {
          const Icone = icones[item.href]
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs",
                ativo(caminho, item.href) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icone />
              {item.nome}
            </Link>
          )
        })}
      </nav>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[260px] bg-sidebar p-0 sm:max-w-[260px]" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <Suspense fallback={null}>
            <SidebarAgenda aoNavegar={() => setMenu(false)} tarefas={tarefas} />
          </Suspense>
        </SheetContent>
      </Sheet>
      <PainelAviso />
    </div>
  )
}

function InterruptorTema({ inicial }: { inicial: boolean }) {
  const escuro = useSyncExternalStore(
    (notificar) => {
      const observador = new MutationObserver(notificar)
      observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      return () => observador.disconnect()
    },
    () => document.documentElement.classList.contains("dark"),
    () => inicial,
  )

  function alternar() {
    const proximo = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", proximo)
    const valor = proximo ? "dark" : "light"
    localStorage.setItem("agenda-tema", valor)
    document.cookie = `agenda-tema=${valor};path=/;max-age=31536000;samesite=lax`
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
      onClick={alternar}
    >
      {escuro ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

function ativo(caminho: string, href: string) {
  if (href === "/") return caminho === "/"
  return caminho === href || caminho.startsWith(`${href}?`) || caminho.startsWith(`${href}/`)
}
