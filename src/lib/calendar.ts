import type { ISODate, Periodicity } from "./types";

/* ============================================================
   Calendar + recurrence utilities — timezone-safe (local Y/M/D).
   No Date.now()/new Date() drift: all math goes through parse/toISO.
   ============================================================ */

export function parseISO(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  const day = r.getDate();
  r.setDate(1);
  r.setMonth(r.getMonth() + n);
  // Clamp to the last day of the target month (e.g. Jan 31 -> Feb 28).
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(day, lastDay));
  return r;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Move forward to the next business day (inclusive). Sat→Mon, Sun→Mon. */
export function toBusinessDay(d: Date): Date {
  const r = new Date(d);
  while (isWeekend(r)) r.setDate(r.getDate() + 1);
  return r;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Sunday-first week start (matches the month grid headers Dom..Sáb). */
export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay());
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Days for a month grid, padded to full weeks (Sun..Sat). */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ----- recurrence ----- */

export const periodicityLabel: Record<Periodicity, string> = {
  unica: "Única",
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
};

export const periodicityDescription: Record<Periodicity, string> = {
  unica: "Visita avulsa, sem repetição",
  semanal: "Repete a cada semana, no mesmo dia útil",
  quinzenal: "Repete a cada 2 semanas",
  mensal: "Repete todo mês, ajustando para dia útil",
};

/**
 * Generate a series of visit dates from a start date.
 * Every occurrence is snapped to a business day, so weekend dates never
 * appear in the agenda — exactly the "distribuir em dias úteis" requirement.
 */
export function generateSeries(
  startISO: ISODate,
  periodicity: Periodicity,
  count: number,
): ISODate[] {
  const start = toBusinessDay(parseISO(startISO));
  if (periodicity === "unica" || count <= 1) return [toISO(start)];

  const out: ISODate[] = [];
  for (let i = 0; i < count; i++) {
    let date: Date;
    if (periodicity === "semanal") date = addDays(start, i * 7);
    else if (periodicity === "quinzenal") date = addDays(start, i * 14);
    else date = addMonths(start, i); // mensal
    out.push(toISO(toBusinessDay(date)));
  }
  return out;
}

/* ----- formatting ----- */

const MES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const MES_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIA_SEMANA = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

export const weekdayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function fmtMonthYear(d: Date): string {
  return `${MES_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDayLong(d: Date): string {
  return `${DIA_SEMANA[d.getDay()]}, ${d.getDate()} de ${MES_FULL[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`;
}

export function fmtWeekRange(anchor: Date): string {
  const days = weekDays(anchor);
  const a = days[0];
  const b = days[6];
  const aStr = `${a.getDate()} ${MES_ABREV[a.getMonth()]}`;
  const bStr = `${b.getDate()} ${MES_ABREV[b.getMonth()]}`;
  return `${aStr} – ${bStr} · ${b.getFullYear()}`;
}

/** Minutes since midnight for an "HH:MM" string. */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
