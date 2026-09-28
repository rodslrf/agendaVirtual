import webpush from "web-push"
import { listarInscricoes, removerInscricao } from "@/modules/agenda/consultas"

export type AvisoPush = {
  titulo: string
  corpo: string
  tipo: "urgente" | "prazo"
  tag: string
  url: string
  alvoTipo: "tarefa" | "compromisso"
  alvoId: number
  hora: string
}

let chavesAplicadas = false

function aplicarChaves() {
  if (chavesAplicadas) return true
  const publica = process.env.VAPID_PUBLIC_KEY
  const privada = process.env.VAPID_PRIVATE_KEY
  const assunto = process.env.VAPID_SUBJECT ?? "mailto:agenda@localhost"
  if (!publica || !privada) return false
  webpush.setVapidDetails(assunto, publica, privada)
  chavesAplicadas = true
  return true
}

export async function enviarPush(aviso: AvisoPush) {
  if (!aplicarChaves()) return false
  const origem = process.env.APP_URL ?? "http://127.0.0.1:3000"
  const icone = aviso.tipo === "urgente" ? "/icone-urgente.png" : "/icone-prazo.png"
  const payload = JSON.stringify({
    title: aviso.tipo === "urgente" ? "Urgente" : "Prazo chegando",
    body: aviso.corpo,
    icon: `${origem}${icone}`,
    tag: aviso.tag,
    url: aviso.url,
    alvoTipo: aviso.alvoTipo,
    alvoId: aviso.alvoId,
    tipo: aviso.tipo,
  })

  const inscricoes = await listarInscricoes()
  let enviou = false
  await Promise.all(
    inscricoes.map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
          },
          payload,
          { TTL: 60 * 60, urgency: "high" },
        )
        enviou = true
      } catch (erro) {
        const status = erro && typeof erro === "object" && "statusCode" in erro ? erro.statusCode : 0
        if (status === 404 || status === 410) await removerInscricao(inscricao.endpoint)
        else console.error("push", status, inscricao.endpoint)
      }
    }),
  )
  return enviou
}

export function pushDeTeste(): AvisoPush {
  return {
    titulo: "Agenda Online",
    corpo: "As notificações do sistema estão ligadas. Este aviso fica até você clicar.",
    tipo: "prazo",
    tag: "agenda-ligada",
    url: "/ajustes",
    alvoTipo: "tarefa",
    alvoId: 0,
    hora: "",
  }
}
