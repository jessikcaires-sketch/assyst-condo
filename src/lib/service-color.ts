/**
 * Cor determinística por serviço — mesmo nome sempre gera a mesma cor.
 * Usa uma paleta curada de matizes BEM distintas (sem vários "quase iguais"),
 * então serviços diferentes ficam visualmente separados. Funciona para
 * serviços do catálogo e personalizados.
 */
import type { CSSProperties } from "react";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Matizes escolhidas a dedo, bem espaçadas no círculo de cores. */
const HUES = [
  4,   // vermelho
  28,  // laranja
  45,  // âmbar
  62,  // mostarda
  140, // verde
  168, // verde-azulado
  190, // ciano
  212, // azul
  236, // índigo
  262, // violeta
  286, // roxo
  312, // magenta
  334, // rosa
  350, // carmim
];

function hueFor(name: string): number {
  return HUES[hash(name.trim().toLowerCase()) % HUES.length];
}

/** Tom pastel com texto escuro legível — ideal para tags/badges de serviço. */
export function serviceColor(name: string): CSSProperties {
  const h = hueFor(name);
  return {
    backgroundColor: `hsl(${h} 72% 93%)`,
    color: `hsl(${h} 55% 28%)`,
    borderColor: `hsl(${h} 50% 80%)`,
  };
}

/** Apenas a cor sólida (ex.: ponto/indicador). */
export function serviceDot(name: string): string {
  return `hsl(${hueFor(name)} 60% 48%)`;
}
