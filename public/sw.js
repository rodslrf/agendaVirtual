self.addEventListener("push", (event) => {
  let dados = {}
  try {
    dados = event.data ? event.data.json() : {}
  } catch {
    dados = {}
  }
  event.waitUntil(
    self.registration.showNotification(dados.title || "Agenda", {
      body: dados.body || "Horário da agenda",
      icon: dados.icon || "/icone-app.png",
      tag: dados.tag || "agenda",
      renotify: true,
      requireInteraction: true,
      data: {
        url: dados.url || "/",
        alvoTipo: dados.alvoTipo,
        alvoId: dados.alvoId,
        tipo: dados.tipo,
      },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const dados = event.notification.data || {}
  if (event.action === "vi") {
    event.waitUntil(
      fetch("/api/avisos/vi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          alvoTipo: dados.alvoTipo,
          alvoId: dados.alvoId,
          tipo: dados.tipo,
        }),
      }),
    )
    return
  }
  event.waitUntil(self.clients.openWindow(dados.url || "/"))
})
