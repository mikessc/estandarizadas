const fmt = new Intl.DateTimeFormat("es-CR", {
  timeZone: "America/Costa_Rica",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** dd/mm/aaaa hh:mm en hora de Costa Rica. */
export function formatDate(d: Date) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

export const pct = (score: number, total: number) => (total ? Math.round((score / total) * 100) : 0);

export const barColor = (p: number) => (p >= 70 ? "bg-green-500" : p >= 50 ? "bg-yellow-400" : "bg-red-500");
