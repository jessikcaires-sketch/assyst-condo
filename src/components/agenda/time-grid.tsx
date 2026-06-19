"use client";

import { timeToMinutes, weekdayShort, sameDay, parseISO } from "@/lib/calendar";
import { visitType } from "@/lib/domain";
import { TODAY } from "@/lib/domain";
import type { Visit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PRO_COLORS } from "./colors";

const START_HOUR = 7;
const END_HOUR = 20;
const HOUR_PX = 56;
const today = parseISO(TODAY);

export interface AgendaEntry {
  visit: Visit;
  condoName: string;
  proName: string;
  proIndex: number;
}

export function TimeGrid({
  days,
  entriesFor,
  onPickDay,
}: {
  days: Date[];
  entriesFor: (day: Date) => AgendaEntry[];
  onPickDay?: (day: Date) => void;
}) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const bodyHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  return (
    <div className="panel overflow-hidden p-0">
      {/* Day headers */}
      <div
        className="grid border-b"
        style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0,1fr))` }}
      >
        <div className="border-r" />
        {days.map((d) => {
          const isToday = sameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onPickDay?.(d)}
              className={cn(
                "flex flex-col items-center gap-0.5 border-r py-2 transition-colors last:border-r-0",
                onPickDay && "hover:bg-muted/50",
              )}
            >
              <span className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                {weekdayShort[d.getDay()]}
              </span>
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full font-display text-sm font-semibold tabular-nums",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time body */}
      <div className="overflow-x-auto">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0,1fr))` }}
        >
          {/* Hour rail */}
          <div className="border-r">
            {hours.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_PX }}>
                <span className="absolute -top-2 right-2 font-mono text-[0.625rem] text-muted-foreground">
                  {h < END_HOUR ? `${String(h).padStart(2, "0")}:00` : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const entries = entriesFor(d);
            return (
              <div
                key={d.toISOString()}
                className="relative border-r last:border-r-0"
                style={{ height: bodyHeight }}
              >
                {/* hour lines */}
                {hours.slice(0, -1).map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-b border-border/60"
                    style={{ top: (h - START_HOUR) * HOUR_PX, height: HOUR_PX }}
                  />
                ))}
                {/* events */}
                {entries.map((e) => {
                  const startMin = timeToMinutes(e.visit.start);
                  const endMin = timeToMinutes(e.visit.end);
                  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_PX;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_PX - 3, 26);
                  const c = PRO_COLORS[e.proIndex % PRO_COLORS.length];
                  const canceled = e.visit.status === "cancelada";
                  return (
                    <div
                      key={e.visit.id}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md border-l-2 px-2 py-1 text-left shadow-sm",
                        c.block,
                        canceled && "opacity-50 line-through",
                      )}
                      style={{ top, height }}
                      title={`${e.condoName} · ${visitType[e.visit.type].label} · ${e.proName} (${e.visit.start}–${e.visit.end})`}
                    >
                      <div className="truncate text-[0.6875rem] font-semibold leading-tight">
                        {e.visit.start} {e.condoName}
                      </div>
                      <div className="truncate text-[0.625rem] leading-tight opacity-80">
                        {visitType[e.visit.type].label} · {e.proName.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
