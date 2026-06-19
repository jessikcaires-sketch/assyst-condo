/**
 * Cor determinística por serviço — mesmo nome sempre gera a mesma cor.
 * Funciona para serviços do catálogo e personalizados (sem limite de paleta).
 * Retorna estilos inline (independente do tema/Tailwind).
 */
import type { CSSProperties } from "react";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Tom pastel com texto escuro legível — ideal para tags/badges de serviço. */
export function serviceColor(name: string): CSSProperties {
  const hue = hash(name.trim().toLowerCase()) % 360;
  return {
    backgroundColor: `hsl(${hue} 72% 94%)`,
    color: `hsl(${hue} 55% 30%)`,
    borderColor: `hsl(${hue} 50% 82%)`,
  };
}

/** Apenas a cor sólida (ex.: ponto/indicador). */
export function serviceDot(name: string): string {
  const hue = hash(name.trim().toLowerCase()) % 360;
  return `hsl(${hue} 60% 50%)`;
}
