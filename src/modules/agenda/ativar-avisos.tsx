"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AvisoInstalacao = Event & { prompt: () => Promise<void> }

export function AtivarAvisos() {
  const [status, setStatus] = useState("Os avisos no celular e no computador precisam de permissão.")
  const [instalacao, setInstalacao] = useState<AvisoInstalacao | null>(null)

  useEffect(() => {
    function ouvir(evento: Event) {
      evento.preventDefault()
      setInstalacao(evento as AvisoInstalacao)
    }
    window.addEventListener("beforeinstallprompt", ouvir)
    return () => window.removeEventListener("beforeinstallprompt", ouvir)
  }, [])

  function ativar() {
    if (!window.isSecureContext) {
      const texto = "Notificação do sistema só liga em https ou em localhost. No celular, o endereço 192.168 não pede permissão."
      setStatus(texto)
      toast.error(texto)
      return
    }
    if (!("Notification" in window)) {
      const texto = "Este navegador não mostra notificação do sistema. Use o Chrome ou o Edge."
      setStatus(texto)
      toast.error(texto)
      return
    }
    if (Notification.permission === "denied") {
      const texto = "Este site já está bloqueado. Clique no cadeado ao lado do endereço, abra Notificações e escolha Permitir. Depois clique de novo aqui."
      setStatus(texto)
      toast.error(texto)
      return
    }
    if (Notification.permission === "granted") {
      void completar()
      return
    }
    // O Chrome recusa sozinho se o pedido não for a primeira coisa do clique.
    void Notification.requestPermission().then((permissao) => {
      if (permissao !== "granted") {
        const texto = "A permissão não foi aceita. Se o aviso nem apareceu, o navegador bloqueou sozinho: no cadeado ao lado do endereço, em Notificações, escolha Permitir."
        setStatus(texto)
        toast.error(texto)
        return
      }
      void completar()
    })
  }

  async function completar() {
    try {
      const registro = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready
      const chaveResposta = await fetch("/api/push/chave")
      const chaveCorpo = (await chaveResposta.json()) as { chave?: string }
      if (!chaveCorpo.chave) {
        const texto = "A chave de aviso ainda não está configurada."
        setStatus(texto)
        toast.error(texto)
        return
      }
      if (!registro.pushManager) {
        const texto = "O Opera aceitou a permissão, mas não recebe aviso com o site fechado."
        setStatus(texto)
        toast.error(texto)
        return
      }
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: paraBytes(chaveCorpo.chave),
      })
      const gravou = await fetch("/api/push/inscrever", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(inscricao),
      })
      const gravouCorpo = (await gravou.json().catch(() => null)) as { push?: boolean } | null
      if (!gravou.ok) {
        const texto = "A permissão foi dada, mas o site não gravou a inscrição."
        setStatus(texto)
        toast.error(texto)
        return
      }
      if (!gravouCorpo?.push) {
        const texto = "A inscrição foi gravada, mas o Windows não recebeu o aviso. Confira se o Opera GX está permitido em Configurações do Windows, Sistema, Notificações."
        setStatus(texto)
        toast.error(texto)
        return
      }
    } catch (erro) {
      const detalhe = erro instanceof Error ? erro.message : "falha desconhecida"
      const texto = `A permissão foi aceita, mas o aviso do sistema falhou (${detalhe}).`
      setStatus(texto)
      toast.error(texto)
      return
    }
    const texto = "Notificação do sistema ligada. O banner do Windows fica até você clicar."
    setStatus(texto)
    toast.success(texto)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações do celular e do PC</CardTitle>
        <CardDescription>
          No cadeado ao lado do endereço, Notificações tem que estar em Permitir. No Windows: Configurações, Sistema, Notificações, Opera GX ligado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <button type="button" className={cn(buttonVariants(), "min-h-11")} onClick={ativar}>
          Ativar notificações
        </button>
        <p className="text-sm text-muted-foreground">{status}</p>
        {instalacao ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={async () => {
              await instalacao.prompt()
              setInstalacao(null)
            }}
          >
            Adicionar à tela inicial
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            No iPhone: Compartilhar e depois Adicionar à Tela de Início.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function paraBytes(base64: string) {
  const preenchida = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  const texto = atob(preenchida.replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(texto, (caractere) => caractere.charCodeAt(0))
}
