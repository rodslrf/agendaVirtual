import {
  CakeIcon,
  DumbbellIcon,
  PlaneIcon,
  StethoscopeIcon,
  PhoneIcon,
  UsersIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react"

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

const CHARMS: Array<{ palavras: string[]; icone: LucideIcon }> = [
  { palavras: ["almoco", "jantar", "cafe", "lanche", "comida"], icone: UtensilsIcon },
  { palavras: ["voo", "aeroporto", "aviao", "embarque"], icone: PlaneIcon },
  { palavras: ["medico", "consulta", "dentista", "exame"], icone: StethoscopeIcon },
  { palavras: ["academia", "treino", "corrida", "yoga"], icone: DumbbellIcon },
  { palavras: ["reuniao", "call", "chamada", "meeting"], icone: UsersIcon },
  { palavras: ["ligar", "telefone"], icone: PhoneIcon },
  { palavras: ["aniversario", "festa"], icone: CakeIcon },
]

export function charmDoTitulo(titulo: string): LucideIcon | null {
  const texto = normalizar(titulo)
  for (const item of CHARMS) {
    if (item.palavras.some((palavra) => texto.includes(palavra))) return item.icone
  }
  return null
}
