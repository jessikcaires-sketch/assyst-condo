"use client";

import { monthGrid, weekdayShort, sameDay, parseISO } from "@/lib/calendar";
import { visitType, TODAY } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { PRO_COLORS } from "./colors";
import type { AgendaEntry } from "./time-grid";

const today = parseISO(TODAY);

export function MonthGrid({
  year,
  month,
  entriesFor,
  onPickDay,
}: {
  year: number;
  month: number;
  entriesFor: (day: Date) => AgendaEntry[];
  onPickDay?: (day: Date) => void;
}) {
  const cells = monthGrid(year, month);

  return (
    <div className="panel overflow-hidden p-0">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {weekdayShort.map((d) => (
          <div
            key={d}
            className="py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const entries = day ? entriesFor(day) : [];
          const isToday = day ? sameDay(day, today) : false;
          const weekend = day ? day.getDay() === 0 || day.getDay() === 6 : false;
          return (
            <button
              key={idx}
              type="button"
              disabled={!day}
              onClick={() => day && onPickDay?.(day)}
              className={cn(
                "flex min-h-[6.5rem] flex-col items-stretch gap-1 border-b border-r p-1.5 text-left align-top transition-colors [&:nth-child(7n)]:border-r-0",
                !day && "bg-muted/20",
                day && "hover:bg-muted/40",
                weekend && day && "bg-muted/25",
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center self-start rounded-full font-mono text-[0.6875rem] tabular-nums",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {entries.slice(0, 3).map((e) => {
                      const c = PRO_COLORS[e.proIndex % PRO_COLORS.length];
                      return (
                        <div
                          key={e.visit.id}
                          className={cn(
                            "flex items-center gap-1 truncate rounded border-l-2 px-1 py-0.5 text-[0.625rem] leading-tight",
                            c.block,
                          )}
                          title={`${e.visit.start} ${e.condoName} · ${visitType[e.visit.type].label} · ${e.proName}`}
                        >
                          <span className="font-mono font-medium">{e.visit.start}</span>
                          <span className="truncate">{e.condoName}</span>
                        </div>
                      );
                    })}
                    {entries.length > 3 && (
                      <span className="px-1 font-mono text-[0.625rem] text-muted-foreground">
                        +{entries.length - 3} mais
                      </span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
