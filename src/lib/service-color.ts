/**
 * Cor por serviço — cada serviço recebe uma cor DISTINTA, de uma paleta
 * curada de 16 cores bem separadas (matiz + saturação variados, pra não ter
 * "verdes parecidos"). A cor vem da POSIÇÃO do serviço no catálogo; serviços
 * fora do catálogo usam um hash estável como fallback.
 */
import type { CSSProperties } from "react";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** [matiz, saturação, luminosidade do fundo] — escolhidas a dedo p/ contraste entre si. */
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [4, 82, 90],    // vermelho
  [22, 88, 87],   // laranja
  [40, 90, 83],   // âmbar
  [54, 85, 80],   // ouro
  [92, 58, 81],   // lima
  [140, 52, 82],  // verde
  [168, 56, 79],  // verde-azulado
  [190, 66, 81],  // ciano
  [208, 82, 85],  // azul-céu
  [226, 82, 88],  // azul
  [248, 70, 89],  // índigo
  [268, 62, 89],  // violeta
  [290, 60, 89],  // roxo
  [314, 72, 90],  // magenta
  [332, 82, 90],  // rosa
  [350, 80, 89],  // carmim
];

function styleAt(index: number): CSSProperties {
  const [h, s, l] = PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
  return {
    backgroundColor: `hsl(${h} ${s}% ${l}%)`,
    color: `hsl(${h} ${Math.min(s + 8, 92)}% 28%)`,
    borderColor: `hsl(${h} ${s}% ${l - 14}%)`,
  };
}

/** Cor pela posição (índice) na lista — uso direto quando se tem o índice. */
export function serviceColorAt(index: number): CSSProperties {
  return styleAt(index);
}

function indexOf(name: string, all?: string[]): number {
  const i = all ? all.indexOf(name) : -1;
  return i >= 0 ? i : hash(name);
}

/** Cor (bg/text/border) para tag/badge de serviço. */
export function serviceColor(name: string, all?: string[]): CSSProperties {
  return styleAt(indexOf(name, all));
}

/** Cor sólida (ponto/indicador). */
export function serviceDot(name: string, all?: string[]): string {
  const [h, s] = PALETTE[indexOf(name, all) % PALETTE.length];
  return `hsl(${h} ${s}% 48%)`;
}
