import { useEffect, useMemo, useRef } from "react";
import { config, breakdown, phaseFor, utcLabel } from "./config.js";
import { useNow } from "./hooks/useNow.js";
import FlipClock from "./components/FlipClock.jsx";
import MilestoneTrack from "./components/MilestoneTrack.jsx";
import { GlitchText, CRTOverlay, Sparkles } from "./components/Overlays.jsx";

const PHASE_LABEL = {
  prestart: "START SEQUENCE ARMED",
  calm: "SYSTEMS NOMINAL",
  urgent: "WARNING · TIME CRITICAL",
  emergency: "EMERGENCY PERIOD",
  alarm: "CRITICAL · FINAL MINUTES",
  timesup: "DEADLINE BREACHED",
};

export default function App() {
  const nowMs = useNow(250);
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const lastBeep = useRef(-1);
  const soundOn = useRef(false);

  const hasStarted = nowMs >= config.startMs;
  const targetMs = hasStarted ? config.endMs : config.startMs;
  const remainMs = targetMs - nowMs;
  const deadlinePhase = phaseFor(remainMs);
  const emergencyMs = config.milestones.find(
    (m) => m.label?.toLowerCase() === "emergency"
  )?.time;
  const inEmergency =
    hasStarted && Number.isFinite(emergencyMs) && nowMs >= emergencyMs;
  const phase = hasStarted
    ? deadlinePhase === "calm" && inEmergency
      ? "emergency"
      : deadlinePhase
    : "prestart";
  const bd = breakdown(remainMs);

  const bkk = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: config.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date(nowMs)),
    [nowMs]
  );

  // ---- audio ----
  function ensureAudio() {
    if (!audioRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    if (audioRef.current && audioRef.current.state === "suspended")
      audioRef.current.resume();
    return audioRef.current;
  }
  function beep(freq, dur, vol = 0.12, type = "square") {
    const ac = audioRef.current;
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ac.destination);
    const now = ac.currentTime;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.start(now);
    o.stop(now + dur);
  }

  useEffect(() => {
    if (!soundOn.current) return;
    ensureAudio();
    if (phase === "alarm" && bd.seconds !== lastBeep.current) {
      lastBeep.current = bd.seconds;
      beep(880, 0.08, 0.1);
    }
    if (phase === "timesup" && lastBeep.current !== -99) {
      lastBeep.current = -99;
      beep(180, 0.7, 0.18, "sawtooth");
      setTimeout(() => beep(120, 1.1, 0.16, "sawtooth"), 250);
    }
    if (phase !== "timesup") lastBeep.current = bd.seconds;
  }, [bd.seconds, phase]);

  function toggleSound(e) {
    soundOn.current = !soundOn.current;
    e.currentTarget.dataset.on = soundOn.current ? "1" : "";
    if (soundOn.current) {
      ensureAudio();
      beep(660, 0.1, 0.08);
    }
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  return (
    <div
      ref={rootRef}
      className={`stage theme-${config.theme} phase-${phase} ${
        config.scanlines ? "crt-on" : ""
      }`}
    >
      {config.scanlines && <CRTOverlay />}
      {config.theme === "signal" && phase !== "timesup" && <Sparkles count={6} />}

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◣◢</span>
          <span className="brand-org">{config.org}</span>
        </div>
        <div className="status">
          <span className={`dot dot-${phase}`} />
          <span className="status-text">{PHASE_LABEL[phase]}</span>
        </div>
      </header>

      <main className="center">
        {phase === "timesup" ? (
          <div className="timesup">
            <GlitchText className="timesup-title" as="h1" text="TIME'S UP" />
            <div className="timesup-sub">
              // SUBMISSIONS LOCKED · STEP AWAY FROM THE KEYBOARD
            </div>
          </div>
        ) : (
          <>
            <div className="title-wrap">
              <GlitchText className="event-title" as="h1" text={config.title} />
              <div className="event-year">{config.year}</div>
            </div>
            <div className="countdown-label">
              {!hasStarted
                ? "HACKATHON STARTS IN"
                : phase === "calm"
                  ? "TIME REMAINING UNTIL DEADLINE"
                  : "DEADLINE IN"}
            </div>
            <FlipClock t={bd} showDays={config.showDays} />
          </>
        )}
      </main>

      {config.showMilestones && phase !== "timesup" && (
        <section className="milestones">
          <MilestoneTrack
            milestones={config.milestones}
            now={nowMs}
            startMs={config.startMs}
            endMs={config.endMs}
          />
        </section>
      )}

      <footer className="footer">
        <div className="foot-left">
          <span className="foot-key">BKK</span>
          <span className="foot-clock">{bkk}</span>
          <span className="foot-tz">
            {config.timezone.toUpperCase()} · {utcLabel()}
          </span>
        </div>
        <div className="foot-right">
          <button className="ctl" onClick={toggleSound} title="Toggle alarm sound">
            <span className="ctl-ico">♪</span> SOUND
          </button>
          <button className="ctl" onClick={toggleFullscreen} title="Fullscreen">
            <span className="ctl-ico">⛶</span> FULLSCREEN
          </button>
        </div>
      </footer>
    </div>
  );
}
