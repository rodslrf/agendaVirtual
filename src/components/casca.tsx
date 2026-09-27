"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDaysIcon, ListChecksIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { modulos } from "@/config/modulos"
import { PainelAviso } from "@/components/painel-aviso"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

const icones = {
  "/": SunIcon,
  "/lista": ListChecksIcon,
  "/agenda": CalendarDaysIcon,
} as const

export function Casca({ children }: { children: React.ReactNode }) {
  const caminho = usePathname()
  const itens = modulos[0].itens

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <p className="text-lg font-semibold tracking-tight">{modulos[0].nome}</p>
          <nav className="hidden items-center gap-1 lg:flex">
            {itens.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  ativo(caminho, item.href) ? "bg-secondary text-foreground" : "text-muted-foreground",
                )}
              >
                {item.nome}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <InterruptorTema />
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
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-72 lg:pb-36">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background lg:hidden">
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
      <PainelAviso />
    </>
  )
}

function InterruptorTema() {
  const [escuro, setEscuro] = useState(false)
  useEffect(() => {
    setEscuro(document.documentElement.classList.contains("dark"))
  }, [])

  function alternar() {
    const proximo = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", proximo)
    localStorage.setItem("agenda-tema", proximo ? "dark" : "light")
    setEscuro(proximo)
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
