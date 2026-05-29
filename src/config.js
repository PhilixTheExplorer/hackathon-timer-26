// ---------------------------------------------------------------------------
// Reads configuration from import.meta.env (Vite injects VITE_* vars).
// Handles times given either with an explicit offset or as wall-clock time in
// the configured IANA timezone (default Asia/Bangkok, UTC+7, no DST).
// ---------------------------------------------------------------------------

const HAS_OFFSET = /([+-]\d\d:?\d\d|Z)$/;

/** Offset (ms) of a timezone at a given UTC instant. */
function tzOffsetMs(timeZone, ts) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = {};
  for (const part of dtf.formatToParts(new Date(ts))) p[part.type] = part.value;
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - ts;
}

/**
 * Convert an ISO-ish string to an absolute timestamp (ms).
 * If it carries an offset/Z it is parsed directly; otherwise it is treated as
 * wall-clock time in `timeZone`.
 */
export function toTimestamp(iso, timeZone) {
  if (!iso) return NaN;
  const s = iso.trim();
  if (HAS_OFFSET.test(s)) return new Date(s).getTime();
  // Treat as UTC first, then correct by the zone's offset at that instant.
  const naive = new Date(s + "Z").getTime();
  let off = tzOffsetMs(timeZone, naive);
  let t = naive - off;
  const off2 = tzOffsetMs(timeZone, t);
  if (off2 !== off) t = naive - off2;
  return t;
}

function bool(v, fallback) {
  if (v == null) return fallback;
  return String(v).toLowerCase() === "true";
}

const env = import.meta.env;
const TIMEZONE = env.VITE_TIMEZONE || "Asia/Bangkok";

function parseMilestones() {
  const raw = env.VITE_MILESTONES;
  let list;
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch (e) {
      console.warn("VITE_MILESTONES is not valid JSON — ignoring.", e);
    }
  }
  if (!Array.isArray(list)) list = [];
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
  return list
    .map((m) => {
      const time = toTimestamp(m.time, TIMEZONE);
      return { label: m.label, time, clock: fmt.format(new Date(time)) };
    })
    .filter((m) => !Number.isNaN(m.time))
    .sort((a, b) => a.time - b.time);
}

export const config = {
  title: env.VITE_EVENT_TITLE || "SIT HACKATHON",
  year: env.VITE_EVENT_YEAR || "2026",
  org: env.VITE_EVENT_ORG || "School of Information Technology · KMUTT",
  timezone: TIMEZONE,
  startMs: toTimestamp(env.VITE_START_TIME || "2026-05-29T09:00:00", TIMEZONE),
  endMs: toTimestamp(env.VITE_END_TIME || "2026-05-31T17:00:00", TIMEZONE),
  urgentMin: Number(env.VITE_URGENT_MIN || 60),
  alarmMin: Number(env.VITE_ALARM_MIN || 5),
  theme: env.VITE_THEME || "signal",
  showDays: bool(env.VITE_SHOW_DAYS, true),
  showMilestones: bool(env.VITE_SHOW_MILESTONES, true),
  scanlines: bool(env.VITE_SCANLINES, true),
  milestones: parseMilestones(),
};

/** Human "UTC+7" style label for the configured timezone, computed now. */
export function utcLabel() {
  const off = tzOffsetMs(TIMEZONE, Date.now()) / 3600000;
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

export function breakdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total: s,
  };
}

export function phaseFor(remainMs) {
  if (remainMs <= 0) return "timesup";
  const min = remainMs / 60000;
  if (min <= config.alarmMin) return "alarm";
  if (min <= config.urgentMin) return "urgent";
  return "calm";
}
