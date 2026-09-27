import { deflateSync, crc32 } from "node:zlib"

const FUNDO_URGENTE: Rgb = [220, 38, 38]
const FUNDO_PRAZO: Rgb = [234, 88, 12]
const FUNDO_APP: Rgb = [15, 118, 110]
const BRANCO: Rgb = [255, 255, 255]

type Rgb = [number, number, number]

const GLIFOS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ":": ["00000", "00100", "00000", "00000", "00100", "00000", "00000"],
}

function pedaco(tipo: string, dados: Buffer) {
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length)
  const nome = Buffer.from(tipo)
  const soma = Buffer.alloc(4)
  soma.writeUInt32BE(crc32(Buffer.concat([nome, dados])) >>> 0)
  return Buffer.concat([tamanho, nome, soma])
}

export function png(
  largura: number,
  altura: number,
  pixel: (x: number, y: number) => Rgb,
) {
  const cru = Buffer.alloc((largura * 4 + 1) * altura)
  for (let y = 0; y < altura; y += 1) {
    const linha = y * (largura * 4 + 1)
    cru[linha] = 0
    for (let x = 0; x < largura; x += 1) {
      const [r, g, b] = pixel(x, y)
      const i = linha + 1 + x * 4
      cru[i] = r
      cru[i + 1] = g
      cru[i + 2] = b
      cru[i + 3] = 255
    }
  }
  const cabecalho = Buffer.alloc(13)
  cabecalho.writeUInt32BE(largura, 0)
  cabecalho.writeUInt32BE(altura, 4)
  cabecalho[8] = 8
  cabecalho[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pedaco("IHDR", cabecalho),
    pedaco("IDAT", deflateSync(cru)),
    pedaco("IEND", Buffer.alloc(0)),
  ])
}

function sino(largura: number, altura: number, fundo: Rgb) {
  const cx = largura / 2
  const cy = altura * 0.5
  const rx = largura * 0.28
  const ry = altura * 0.24
  return (x: number, y: number): Rgb => {
    const nx = (x - cx) / rx
    const ny = (y - cy) / ry
    const cupula = nx * nx + ny * ny <= 1 && y < cy + ry * 0.45
    const base =
      y > cy + ry * 0.25 && y < cy + ry * 0.62 && Math.abs(x - cx) < rx * 1.05
    const haste =
      Math.abs(x - cx) < largura * 0.03 && y > cy - ry * 1.15 && y < cy - ry * 0.55
    const bola = (x - cx) ** 2 + (y - (cy - ry * 1.2)) ** 2 < (largura * 0.045) ** 2
    const badalo = (x - cx) ** 2 + (y - (cy + ry * 0.82)) ** 2 < (largura * 0.055) ** 2
    if (cupula || base || haste || bola || badalo) return BRANCO
    return fundo
  }
}

export function icone(tipo: "urgente" | "prazo" | "app") {
  const fundo = tipo === "urgente" ? FUNDO_URGENTE : tipo === "prazo" ? FUNDO_PRAZO : FUNDO_APP
  return png(192, 192, sino(192, 192, fundo))
}

function desenharTexto(
  pixel: Rgb[][],
  texto: string,
  escala: number,
  origemX: number,
  origemY: number,
  cor: Rgb,
) {
  let cursor = origemX
  for (const caractere of texto) {
    const glifo = GLIFOS[caractere]
    if (!glifo) {
      cursor += 4 * escala
      continue
    }
    glifo.forEach((linha, y) => {
      ;[...linha].forEach((bit, x) => {
        if (bit !== "1") return
        for (let dy = 0; dy < escala; dy += 1) {
          for (let dx = 0; dx < escala; dx += 1) {
            const px = cursor + x * escala + dx
            const py = origemY + y * escala + dy
            if (pixel[py]?.[px]) pixel[py][px] = cor
          }
        }
      })
    })
    cursor += 6 * escala
  }
  return cursor - origemX
}

export function faixa(tipo: "urgente" | "prazo", hora: string) {
  const largura = 720
  const altura = 280
  const fundo = tipo === "urgente" ? FUNDO_URGENTE : FUNDO_PRAZO
  const grade = Array.from({ length: altura }, () =>
    Array.from({ length: largura }, () => fundo),
  )
  const texto = /^(\d{2}:\d{2})$/.test(hora) ? hora : "AGORA"
  const escala = texto === "AGORA" ? 16 : 22
  const larguraTexto = texto.length * 6 * escala
  desenharTexto(
    grade,
    texto,
    escala,
    Math.round((largura - larguraTexto) / 2),
    Math.round((altura - 7 * escala) / 2),
    BRANCO,
  )
  return png(largura, altura, (x, y) => grade[y][x])
}
