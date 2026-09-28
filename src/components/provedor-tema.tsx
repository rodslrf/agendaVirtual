"use client"

import { useLayoutEffect } from "react"

export function ProvedorTema({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    try {
      const salvo = localStorage.getItem("agenda-tema")
      if (salvo !== "dark" && salvo !== "light") return
      document.documentElement.classList.toggle("dark", salvo === "dark")
      document.cookie = `agenda-tema=${salvo};path=/;max-age=31536000;samesite=lax`
    } catch {
      // storage ou cookie indisponível
    }
  }, [])
  return children
}
