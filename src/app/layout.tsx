import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Casca } from "@/components/casca"
import { ProvedorTema } from "@/components/provedor-tema"
import { listarTarefas } from "@/modules/agenda/consultas"
import { verTarefa } from "@/modules/agenda/mapear"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ROTINA Pro - LR CONT",
  description: "Tarefas e horários do dia.",
  applicationName: "ROTINA Pro - LR CONT",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icone-app.png", apple: "/icone-app.png" },
  appleWebApp: { capable: true, title: "ROTINA Pro - LR CONT", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  themeColor: "#855F8C",
  width: "device-width",
  initialScale: 1,
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const tema = (await cookies()).get("agenda-tema")?.value
  const escuro = tema === "dark"
  const tarefas = (await listarTarefas("aberta")).map(verTarefa)
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased${escuro ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden bg-background text-foreground">
        <ProvedorTema>
          <Casca temaEscuro={escuro} tarefas={tarefas}>
            {children}
          </Casca>
          <Toaster position="top-center" />
        </ProvedorTema>
      </body>
    </html>
  )
}
