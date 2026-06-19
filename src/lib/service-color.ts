/**
 * Cor por serviço — cada serviço recebe uma cor DISTINTA.
 *
 * A cor vem da POSIÇÃO do serviço na lista do catálogo, usando o "ângulo
 * dourado" (137.5°) para espalhar os matizes ao máximo. Assim, dois serviços
 * nunca caem na mesma cor (até a paleta dar a volta). Serviços fora do catálogo
 * (personalizados) usam um hash estável como fallback.
 */
import type { CSSProperties } from "react";

const GOLDEN = 137.508;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function hueFromIndex(i: number): number {
  return (i * GOLDEN) % 360;
}

function styleFromHue(h: number): CSSProperties {
  return {
    backgroundColor: `hsl(${h} 72% 92%)`,
    color: `hsl(${h} 58% 28%)`,
    borderColor: `hsl(${h} 52% 78%)`,
  };
}

/** Cor pela posição (índice) na lista — uso direto quando se tem o índice. */
export function serviceColorAt(index: number): CSSProperties {
  return styleFromHue(hueFromIndex(index));
}

/** Resolve o índice do serviço dentro do catálogo; fora dele, usa hash estável. */
function indexOf(name: string, all?: string[]): number {
  const i = all ? all.indexOf(name) : -1;
  return i >= 0 ? i : hash(name);
}

/** Cor pastel (bg/text/border) para tag/badge de serviço. */
export function serviceColor(name: string, all?: string[]): CSSProperties {
  return styleFromHue(hueFromIndex(indexOf(name, all)));
}

/** Cor sólida (ponto/indicador). */
export function serviceDot(name: string, all?: string[]): string {
  return `hsl(${hueFromIndex(indexOf(name, all))} 60% 48%)`;
}
