import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Casca } from "@/components/casca"
import { ProvedorTema } from "@/components/provedor-tema"
import { avaliar } from "@/server/alerts/avaliar"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
})

export const metadata: Metadata = {
  title: "Agenda",
  description: "Tarefas e horários do dia.",
  applicationName: "Agenda",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icone-app.png", apple: "/icone-app.png" },
  appleWebApp: { capable: true, title: "Agenda", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: LayoutProps<"/">) {
  try {
    await avaliar()
  } catch (erro) {
    console.error(erro)
  }

  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{if(localStorage.getItem("agenda-tema")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()',
          }}
        />
        <ProvedorTema>
          <Casca>{children}</Casca>
          <Toaster position="top-center" />
        </ProvedorTema>
      </body>
    </html>
  )
}
