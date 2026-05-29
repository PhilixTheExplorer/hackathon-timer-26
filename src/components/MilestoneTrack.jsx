export default function MilestoneTrack({ milestones, now, startMs, endMs }) {
  const span = Math.max(1, endMs - startMs);
  const pct = Math.min(100, Math.max(0, ((now - startMs) / span) * 100));
  return (
    <div className="track">
      <div className="track-line">
        <div className="track-fill" style={{ width: pct + "%" }} />
        <div className="track-head" style={{ left: pct + "%" }} />
      </div>
      <div className="track-nodes">
        {milestones.map((m, i) => {
          const p = Math.min(100, Math.max(0, ((m.time - startMs) / span) * 100));
          const passed = now >= m.time;
          const active =
            now >= m.time &&
            (i === milestones.length - 1 || now < milestones[i + 1].time);
          const edge = p < 6 ? "start" : p > 94 ? "end" : "mid";
          return (
            <div
              key={i}
              className={
                "node edge-" + edge + (passed ? " passed" : "") + (active ? " active" : "")
              }
              style={{ left: p + "%" }}
            >
              <div className="node-dot" />
              <div className="node-label">
                <span className="node-name">{m.label}</span>
                <span className="node-time">{m.clock}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
