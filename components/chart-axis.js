"use client";

// Custom Recharts axis ticks that print the actual dates a point covers, not
// just a month or season name. A farmer reading "ມິ.ຖ" cannot tell whether it
// means the whole of June or the eight days the data really spans — the day
// numbers underneath remove that ambiguity.

import { dayRangeLabel } from "@/lib/format";

// Month axis: "ມິ.ຖ 26" on the first line, the day numbers it covers ("1–8")
// on the second. `data` is the same array handed to the chart; Recharts gives
// the tick its category index, which we use to find the point.
export function MonthDayTick({ x, y, payload, data }) {
  const point = data?.[payload?.index];
  const days = dayRangeLabel(point);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={12}
        textAnchor="middle"
        fill="var(--muted-foreground)"
        fontSize={11}
      >
        {payload?.value}
      </text>
      {days && (
        <text
          dy={25}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize={9}
          opacity={0.75}
        >
          {days}
        </text>
      )}
    </g>
  );
}

// Season axis: season name plus the calendar month numbers it spans
// ("ລະດູຝົນ" / "5, 6, 7, 8, 9, 10"), so the bar is anchored to real months.
export function SeasonMonthTick({ x, y, payload, data }) {
  const point = data?.[payload?.index];
  const months = point?.monthNumbersLabel;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={12}
        textAnchor="middle"
        fill="var(--muted-foreground)"
        fontSize={11}
      >
        {payload?.value}
      </text>
      {months && (
        <text
          dy={25}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize={9}
          opacity={0.75}
        >
          ເດືອນ {months}
        </text>
      )}
    </g>
  );
}
