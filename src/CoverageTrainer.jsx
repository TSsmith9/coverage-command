import { useState, useCallback, useEffect, useMemo, Fragment } from "react";

// ---------- Design tokens ----------
// Field green deep #0F3D2E · Field green mid #17573F · Chalk cream #EDE6D6
// Hash gold #C9A24B · Correct gold #D8B25C · Incorrect brick #C1432E

const COVERAGES = [
  {
    id: "c0",
    label: "Cover 0",
    sub: "No deep help — all-out man",
    manOrZone: "man",
    tell:
      "Nobody plays deep. Every defender, including the safeties, is within about 8 yards of the ball, either pressed on a receiver or walked up to blitz.",
    weakness:
      "There's no help over the top. A receiver who wins his release cleanly can take it the distance — but the rush usually arrives fast, so timing has to be immediate.",
    attack: "Fast, quick throws before the rush arrives",
  },
  {
    id: "c1",
    label: "Cover 1",
    sub: "Single-high man",
    manOrZone: "man",
    tell:
      "One safety sits deep in the exact middle of the field. Everyone else is matched up tight underneath, man to man.",
    weakness:
      "That one safety is covering a lot of ground alone. Picks, rubs, and crossing routes stress the man defenders, and the deep middle is thinner than it looks.",
    attack: "Crossers and picks to stress the lone deep safety",
    rotationAttack:
      "Push a vertical seam immediately, before the late safety gains depth. If this rotated from a Cover 0 look, expect extra time in the pocket too.",
  },
  {
    id: "c2",
    label: "Cover 2",
    sub: "Two-deep, corners squat",
    manOrZone: "zone",
    tell:
      "Two safeties split the deep field in half. The corners sit low near the line instead of bailing — they're playing the flat, not deep.",
    weakness:
      "The deep middle seam, right between the two safeties, and any corner route thrown over a low-sitting corner before the safety can rotate over.",
    attack: "The deep middle seam, between the two safeties",
    rotationAttack:
      "Attack the deep middle seam early, before the new half-safety gains width — and check what area he rotated up from underneath.",
  },
  {
    id: "c3",
    label: "Cover 3",
    sub: "Three-deep, corners bail",
    manOrZone: "zone",
    tell:
      "Three defenders — both corners and a safety — bail into deep thirds at the snap. A linebacker drops to the middle underneath zone.",
    weakness:
      "The flats, since both corners bailed out of them, and the seams on either side of the middle-of-field safety.",
    attack: "The flats and the seams off the middle safety",
    rotationAttack:
      "Trust the flat over the seam here — the flat is open by simple timing, while the seam only opens if the rotating defender landed somewhere else.",
  },
  {
    id: "c4",
    label: "Cover 4",
    sub: "Quarters — four deep, dead flat",
    manOrZone: "zone",
    tell:
      "Four defenders spread evenly across the deep field in a straight line — nobody low on the outside, nobody low inside.",
    weakness:
      "Underneath. Only a few defenders are left short of the deep zones, so intermediate routes and the run game have room.",
    attack: "Underneath routes and the run game",
    rotationAttack:
      "Attack back to the side the rotation came from — his old assignment (box support or a flat/curl zone) is emptiest. Take it vertically before he settles into depth.",
  },
];

const WR_X = { x: 70, motioned: 300, slot1: 470, slot2: 570, z: 670 };
const LOS_Y = 335;
const jitter = (n) => n + (Math.random() * 14 - 7);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildScenario(covId) {
  let CB1, CB2, Nickel, S1, S2, LB1, LB2, LB3;
  switch (covId) {
    case "c0":
      CB1 = { x: jitter(WR_X.x), y: jitter(305) };
      CB2 = { x: jitter(WR_X.z), y: jitter(305) };
      Nickel = { x: jitter(WR_X.slot2), y: jitter(300) };
      S1 = { x: jitter(230), y: jitter(255) };
      S2 = { x: jitter(430), y: jitter(240) };
      LB1 = { x: jitter(330), y: jitter(275) };
      LB2 = { x: jitter(400), y: jitter(260) };
      LB3 = { x: jitter(560), y: jitter(280) };
      break;
    case "c1":
      CB1 = { x: jitter(WR_X.x), y: jitter(300) };
      CB2 = { x: jitter(WR_X.z), y: jitter(300) };
      Nickel = { x: jitter(WR_X.slot2), y: jitter(295) };
      S1 = { x: jitter(400), y: jitter(85) };
      S2 = { x: jitter(360), y: jitter(250) };
      LB1 = { x: jitter(320), y: jitter(270) };
      LB2 = { x: jitter(410), y: jitter(260) };
      LB3 = { x: jitter(520), y: jitter(275) };
      break;
    case "c2":
      CB1 = { x: jitter(WR_X.x), y: jitter(300) };
      CB2 = { x: jitter(WR_X.z), y: jitter(300) };
      Nickel = { x: jitter(WR_X.slot2), y: jitter(290) };
      S1 = { x: jitter(280), y: jitter(115) };
      S2 = { x: jitter(520), y: jitter(115) };
      LB1 = { x: jitter(330), y: jitter(265) };
      LB2 = { x: jitter(410), y: jitter(255) };
      LB3 = { x: jitter(500), y: jitter(265) };
      break;
    case "c3":
      CB1 = { x: jitter(WR_X.x), y: jitter(130) };
      CB2 = { x: jitter(WR_X.z), y: jitter(130) };
      Nickel = { x: jitter(WR_X.slot2), y: jitter(280) };
      S1 = { x: jitter(400), y: jitter(95) };
      S2 = { x: jitter(390), y: jitter(250) };
      LB1 = { x: jitter(320), y: jitter(255) };
      LB2 = { x: jitter(400), y: jitter(235) };
      LB3 = { x: jitter(500), y: jitter(255) };
      break;
    case "c4":
    default:
      CB1 = { x: jitter(WR_X.x), y: jitter(115) };
      CB2 = { x: jitter(WR_X.z), y: jitter(115) };
      Nickel = { x: jitter(WR_X.slot2), y: jitter(120) };
      S1 = { x: jitter(250), y: jitter(110) };
      S2 = { x: jitter(430), y: jitter(110) };
      LB1 = { x: jitter(340), y: jitter(275) };
      LB2 = { x: jitter(430), y: jitter(265) };
      LB3 = { x: jitter(530), y: jitter(280) };
      break;
  }
  return { CB1, CB2, Nickel, S1, S2, LB1, LB2, LB3 };
}

function newScenario() {
  const cov = COVERAGES[Math.floor(Math.random() * COVERAGES.length)];
  return { cov, dots: buildScenario(cov.id) };
}

function newDisguiseScenario() {
  const rotatable = COVERAGES.filter((c) => ["c1", "c2", "c3", "c4"].includes(c.id));
  const played = rotatable[Math.floor(Math.random() * rotatable.length)];
  const shownPool = COVERAGES.filter((c) => c.id !== played.id);
  const shown = shownPool[Math.floor(Math.random() * shownPool.length)];
  return {
    shown,
    played,
    shownDots: buildScenario(shown.id),
    playedDots: buildScenario(played.id),
  };
}

function buildAttackChoices(correctId) {
  const others = COVERAGES.filter((c) => c.id !== correctId);
  const distractors = shuffle(others).slice(0, 3);
  const correct = COVERAGES.find((c) => c.id === correctId);
  return shuffle([correct, ...distractors]).map((c) => ({ id: c.id, text: c.attack }));
}

function buildCrackChoices(correctId) {
  const rotatable = COVERAGES.filter((c) => ["c1", "c2", "c3", "c4"].includes(c.id));
  return shuffle(rotatable).map((c) => ({ id: c.id, text: c.rotationAttack }));
}

function offenseFor(motioned) {
  return [
    { label: "X", x: motioned ? WR_X.motioned : WR_X.x, y: LOS_Y, moving: true },
    { label: "Y", x: WR_X.slot1, y: LOS_Y },
    { label: "H", x: WR_X.slot2, y: LOS_Y + 4 },
    { label: "Z", x: WR_X.z, y: LOS_Y },
    { label: "QB", x: 380, y: LOS_Y + 45 },
    { label: "RB", x: 415, y: LOS_Y + 68 },
    ...[0, 1, 2, 3, 4].map((i) => ({ label: "", x: 220 + i * 40, y: LOS_Y + 8, ol: true })),
  ];
}

const STATIC_OFFENSE = offenseFor(false);

function defenseFor(dots, cov, motioned) {
  const out = { ...dots };
  if (motioned && cov.manOrZone === "man") {
    out.CB1 = { x: WR_X.motioned - 16, y: dots.CB1.y };
  }
  return out;
}

function Field({ offense, dots, showRoofline }) {
  const roofline = useMemo(() => {
    const { CB1, CB2, Nickel, S1, S2 } = dots;
    const pts = [CB1, S1, S2, Nickel, CB2].sort((a, b) => a.x - b.x);
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  }, [dots]);

  return (
    <svg viewBox="0 0 740 420" className="w-full h-auto block">
      {[60, 130, 200, 270, 405, 475, 545, 615, 685].map((x) => (
        <line key={x} x1={x} y1="10" x2={x} y2="410" stroke="rgba(237,230,214,0.08)" strokeWidth="1" />
      ))}
      <line x1="20" y1={LOS_Y} x2="720" y2={LOS_Y} stroke="#EDE6D6" strokeOpacity="0.55" strokeWidth="2" />
      <text x="26" y={LOS_Y - 6} className="ct-mono" fontSize="10" fill="#EDE6D6" opacity="0.5">LOS</text>

      {offense.map((p, i) =>
        p.ol ? (
          <rect key={i} x={p.x - 9} y={p.y - 6} width="18" height="12" rx="2" fill="#8C7A4E" opacity="0.8" />
        ) : (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="9" fill="#EDE6D6" className={p.moving ? "ct-mover" : ""} />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0F3D2E">{p.label}</text>
          </g>
        )
      )}

      {Object.entries(dots).map(([key, p]) => {
        const label = key === "Nickel" ? "N" : key.startsWith("CB") ? "C" : key.startsWith("S") ? "S" : "L";
        return (
          <g key={key}>
            <circle cx={p.x} cy={p.y} r="9" fill="#C1432E" opacity="0.92" className="ct-mover" />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#EDE6D6">{label}</text>
          </g>
        );
      })}

      {showRoofline && (
        <polyline points={roofline} fill="none" stroke="#C9A24B" strokeWidth="2" className="ct-roofline" />
      )}
    </svg>
  );
}

function ChoiceGrid({ choices, picked, correctId, onPick, cols = "grid-cols-2 sm:grid-cols-5", display }) {
  return (
    <div className={`grid ${cols} gap-2`}>
      {choices.map((c) => {
        const isPicked = picked === c.id;
        const isCorrectAnswer = picked !== null && c.id === correctId;
        let border = "rgba(237,230,214,0.25)";
        let bg = "rgba(11,64,48,0.5)";
        if (picked !== null && isCorrectAnswer) { border = "#C9A24B"; bg = "rgba(201,162,75,0.18)"; }
        else if (isPicked && !isCorrectAnswer) { border = "#C1432E"; bg = "rgba(193,67,46,0.18)"; }
        return (
          <button
            key={c.id}
            disabled={picked !== null}
            onClick={() => onPick(c.id)}
            className={`ct-btn rounded-md py-3 px-3 text-sm border text-left ${display === "label" ? "ct-display font-semibold text-center" : ""}`}
            style={{ borderColor: border, background: bg, color: "#EDE6D6" }}
          >
            {c.text || c.label}
          </button>
        );
      })}
    </div>
  );
}

const emptyStat = () => ({ mzRight: 0, mzTotal: 0, idRight: 0, idTotal: 0, atkRight: 0, atkTotal: 0 });
const emptyRotStat = () => ({ idRight: 0, idTotal: 0, crackRight: 0, crackTotal: 0 });

// ---------- Persistence ----------
// Only durable stats persist across sessions; in-flight scenario/stage state resets on reload.
const STORAGE_KEY = "coverage-command:stats:v1";

function defaultStats() {
  return {
    mzScore: { right: 0, total: 0 },
    idScore: { right: 0, total: 0 },
    atkScore: { right: 0, total: 0 },
    streak: 0,
    perCoverage: Object.fromEntries(COVERAGES.map((c) => [c.id, emptyStat()])),
    dIdScore: { right: 0, total: 0 },
    dCrackScore: { right: 0, total: 0 },
    dStreak: 0,
    perRotation: Object.fromEntries(["c1", "c2", "c3", "c4"].map((id) => [id, emptyRotStat()])),
  };
}

function loadStats() {
  const defaults = defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export default function CoverageTrainer() {
  const [mode, setMode] = useState("full"); // 'full' | 'disguise'
  const saved = useMemo(() => loadStats(), []);

  // ---- Full Rep mode state ----
  const [scenario, setScenario] = useState(() => newScenario());
  const [stage, setStage] = useState("motion");
  const [motioned, setMotioned] = useState(false);
  const [mzPicked, setMzPicked] = useState(null);
  const [picked, setPicked] = useState(null);
  const [attackChoices, setAttackChoices] = useState(null);
  const [attackPicked, setAttackPicked] = useState(null);

  const [mzScore, setMzScore] = useState(saved.mzScore);
  const [idScore, setIdScore] = useState(saved.idScore);
  const [atkScore, setAtkScore] = useState(saved.atkScore);
  const [streak, setStreak] = useState(saved.streak);
  const [perCoverage, setPerCoverage] = useState(saved.perCoverage);

  // ---- Disguise Rotation mode state ----
  const [dScenario, setDScenario] = useState(() => newDisguiseScenario());
  const [dStage, setDStage] = useState("shown"); // 'shown' | 'played-id' | 'crack'
  const [dPicked, setDPicked] = useState(null);
  const [crackChoices, setCrackChoices] = useState(null);
  const [crackPicked, setCrackPicked] = useState(null);
  const [dIdScore, setDIdScore] = useState(saved.dIdScore);
  const [dCrackScore, setDCrackScore] = useState(saved.dCrackScore);
  const [dStreak, setDStreak] = useState(saved.dStreak);
  const [perRotation, setPerRotation] = useState(saved.perRotation);

  useEffect(() => {
    const stats = {
      mzScore, idScore, atkScore, streak, perCoverage,
      dIdScore, dCrackScore, dStreak, perRotation,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // storage unavailable (e.g. private browsing) — stats just won't persist
    }
  }, [mzScore, idScore, atkScore, streak, perCoverage, dIdScore, dCrackScore, dStreak, perRotation]);

  const mzAnswered = mzPicked !== null;
  const mzCorrect = mzAnswered && mzPicked === scenario.cov.manOrZone;
  const idAnswered = picked !== null;
  const idCorrect = idAnswered && picked === scenario.cov.id;
  const atkAnswered = attackPicked !== null;
  const atkCorrect = atkAnswered && attackPicked === scenario.cov.id;

  const liveDots = useMemo(() => defenseFor(scenario.dots, scenario.cov, motioned), [scenario, motioned]);
  const offense = useMemo(() => offenseFor(motioned), [motioned]);

  const sendMotion = useCallback(() => setMotioned(true), []);

  const handlePickMz = useCallback((val) => {
    if (mzAnswered) return;
    setMzPicked(val);
    const isRight = val === scenario.cov.manOrZone;
    setMzScore((s) => ({ right: s.right + (isRight ? 1 : 0), total: s.total + 1 }));
    setPerCoverage((pc) => {
      const cur = pc[scenario.cov.id];
      return { ...pc, [scenario.cov.id]: { ...cur, mzRight: cur.mzRight + (isRight ? 1 : 0), mzTotal: cur.mzTotal + 1 } };
    });
  }, [mzAnswered, scenario]);

  const goToRead = useCallback(() => setStage("read"), []);

  const handlePickCoverage = useCallback((id) => {
    if (idAnswered) return;
    setPicked(id);
    const isRight = id === scenario.cov.id;
    setIdScore((s) => ({ right: s.right + (isRight ? 1 : 0), total: s.total + 1 }));
    setPerCoverage((pc) => {
      const cur = pc[scenario.cov.id];
      return { ...pc, [scenario.cov.id]: { ...cur, idRight: cur.idRight + (isRight ? 1 : 0), idTotal: cur.idTotal + 1 } };
    });
    setAttackChoices(buildAttackChoices(scenario.cov.id));
  }, [idAnswered, scenario]);

  const goToAttack = useCallback(() => setStage("attack"), []);

  const handlePickAttack = useCallback((id) => {
    if (atkAnswered) return;
    setAttackPicked(id);
    const isRight = id === scenario.cov.id;
    setAtkScore((s) => ({ right: s.right + (isRight ? 1 : 0), total: s.total + 1 }));
    setPerCoverage((pc) => {
      const cur = pc[scenario.cov.id];
      return { ...pc, [scenario.cov.id]: { ...cur, atkRight: cur.atkRight + (isRight ? 1 : 0), atkTotal: cur.atkTotal + 1 } };
    });
    setStreak((s) => (mzCorrect && idCorrect && isRight ? s + 1 : 0));
  }, [atkAnswered, scenario, mzCorrect, idCorrect]);

  const next = useCallback(() => {
    setMotioned(false);
    setMzPicked(null);
    setPicked(null);
    setAttackPicked(null);
    setAttackChoices(null);
    setStage("motion");
    setScenario(newScenario());
  }, []);

  // ---- Disguise handlers ----
  const dIdAnswered = dPicked !== null;
  const dIdCorrect = dIdAnswered && dPicked === dScenario.played.id;
  const crackAnswered = crackPicked !== null;
  const crackCorrect = crackAnswered && crackPicked === dScenario.played.id;
  const dDots = dStage === "shown" ? dScenario.shownDots : dScenario.playedDots;

  const snapIt = useCallback(() => setDStage("played-id"), []);

  const handlePickPlayed = useCallback((id) => {
    if (dIdAnswered) return;
    setDPicked(id);
    const isRight = id === dScenario.played.id;
    setDIdScore((s) => ({ right: s.right + (isRight ? 1 : 0), total: s.total + 1 }));
    setPerRotation((pr) => {
      const cur = pr[dScenario.played.id];
      return { ...pr, [dScenario.played.id]: { ...cur, idRight: cur.idRight + (isRight ? 1 : 0), idTotal: cur.idTotal + 1 } };
    });
    setCrackChoices(buildCrackChoices(dScenario.played.id));
  }, [dIdAnswered, dScenario]);

  const goToCrack = useCallback(() => setDStage("crack"), []);

  const handlePickCrack = useCallback((id) => {
    if (crackAnswered) return;
    setCrackPicked(id);
    const isRight = id === dScenario.played.id;
    setDCrackScore((s) => ({ right: s.right + (isRight ? 1 : 0), total: s.total + 1 }));
    setPerRotation((pr) => {
      const cur = pr[dScenario.played.id];
      return { ...pr, [dScenario.played.id]: { ...cur, crackRight: cur.crackRight + (isRight ? 1 : 0), crackTotal: cur.crackTotal + 1 } };
    });
    setDStreak((s) => (dIdCorrect && isRight ? s + 1 : 0));
  }, [crackAnswered, dScenario, dIdCorrect]);

  const dNext = useCallback(() => {
    setDPicked(null);
    setCrackPicked(null);
    setCrackChoices(null);
    setDStage("shown");
    setDScenario(newDisguiseScenario());
  }, []);

  const pct = (s) => (s.total ? Math.round((s.right / s.total) * 100) : null);

  useEffect(() => {
    document.title = "Coverage Reads";
  }, []);

  return (
    <div className="coverage-trainer min-h-screen w-full flex flex-col items-center py-8 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .coverage-trainer { background: radial-gradient(ellipse at top, #17573F 0%, #0F3D2E 60%, #0A2A20 100%); font-family: 'Inter', sans-serif; color: #EDE6D6; }
        .ct-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
        .ct-mono { font-family: 'IBM Plex Mono', monospace; }
        .ct-btn { transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease; }
        .ct-btn:not(:disabled):hover { transform: translateY(-2px); }
        .ct-btn:disabled { cursor: default; }
        .ct-fade-in { animation: ctFadeIn 0.35s ease both; }
        @keyframes ctFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .ct-roofline { stroke-dasharray: 6 5; animation: ctDash 0.6s ease forwards; }
        @keyframes ctDash { from { stroke-dashoffset: 40; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        .ct-step { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; }
        .ct-mover { transition: cx 0.8s cubic-bezier(.4,0,.2,1), cy 0.8s cubic-bezier(.4,0,.2,1); }
        .ct-tab { transition: all 0.15s ease; }
      `}</style>

      <div className="w-full max-w-5xl">
        <header className="mb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="ct-mono text-xs tracking-widest uppercase" style={{ color: "#C9A24B" }}>
              Pre-snap read drill
            </p>
            <h1 className="ct-display text-3xl sm:text-4xl font-semibold" style={{ color: "#EDE6D6" }}>
              Coverage Command
            </h1>
          </div>
        </header>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("full")}
            className="ct-tab ct-display rounded-md px-4 py-2 text-sm font-semibold border"
            style={{
              borderColor: mode === "full" ? "#C9A24B" : "rgba(237,230,214,0.25)",
              background: mode === "full" ? "rgba(201,162,75,0.18)" : "rgba(11,64,48,0.5)",
              color: "#EDE6D6",
            }}
          >
            Full Rep
          </button>
          <button
            onClick={() => setMode("disguise")}
            className="ct-tab ct-display rounded-md px-4 py-2 text-sm font-semibold border"
            style={{
              borderColor: mode === "disguise" ? "#C9A24B" : "rgba(237,230,214,0.25)",
              background: mode === "disguise" ? "rgba(201,162,75,0.18)" : "rgba(11,64,48,0.5)",
              color: "#EDE6D6",
            }}
          >
            Disguise Rotation
          </button>
        </div>

        {mode === "full" && (
          <>
            <div className="flex gap-4 ct-mono text-sm flex-wrap mb-3">
              <Stat label="Man/Zone" score={mzScore} />
              <Stat label="Read" score={idScore} />
              <Stat label="Attack" score={atkScore} />
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide opacity-60">Streak</div>
                <div className="text-lg" style={{ color: "#C9A24B" }}>{streak}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: "rgba(201,162,75,0.35)", background: "#0B4030" }}>
                <Field offense={offense} dots={liveDots} showRoofline={stage !== "motion"} />
              </div>
              <Sidebar perCoverage={perCoverage} />
            </div>

            <div className="mt-5">
              <p className="ct-step opacity-60 mb-2">
                {{ motion: "STEP 1 OF 3", read: "STEP 2 OF 3", attack: "STEP 3 OF 3" }[stage]}
              </p>

              {stage === "motion" && !motioned && (
                <div>
                  <button onClick={sendMotion} className="ct-btn ct-display rounded-md px-5 py-3 text-sm font-semibold border"
                    style={{ borderColor: "#C9A24B", background: "rgba(201,162,75,0.15)", color: "#EDE6D6" }}>
                    Send X in motion →
                  </button>
                  <p className="text-sm opacity-60 ct-mono mt-3">Motion X across the formation and watch the defense react.</p>
                </div>
              )}

              {stage === "motion" && motioned && (
                <>
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {["man", "zone"].map((val) => {
                      const isPicked = mzPicked === val;
                      const isCorrectAnswer = mzAnswered && val === scenario.cov.manOrZone;
                      let border = "rgba(237,230,214,0.25)", bg = "rgba(11,64,48,0.5)";
                      if (mzAnswered && isCorrectAnswer) { border = "#C9A24B"; bg = "rgba(201,162,75,0.18)"; }
                      else if (isPicked && !isCorrectAnswer) { border = "#C1432E"; bg = "rgba(193,67,46,0.18)"; }
                      return (
                        <button key={val} disabled={mzAnswered} onClick={() => handlePickMz(val)}
                          className="ct-btn ct-display rounded-md py-3 px-2 text-sm font-semibold border capitalize"
                          style={{ borderColor: border, background: bg, color: "#EDE6D6" }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 min-h-[110px]">
                    {mzAnswered && (
                      <FeedbackCard correct={mzCorrect} title={`${mzCorrect ? "Correct" : "Not quite"} — that was ${scenario.cov.manOrZone}`}>
                        <p className="text-sm opacity-90">
                          {scenario.cov.manOrZone === "man"
                            ? "The corner followed X across the formation — that's man."
                            : "Nobody followed X across the formation — that's zone."}
                        </p>
                        <NextButton onClick={goToRead} label="Step 2: call the shell →" />
                      </FeedbackCard>
                    )}
                    {!mzAnswered && <p className="text-sm opacity-60 ct-mono">Did a defender follow X, or hold his ground?</p>}
                  </div>
                </>
              )}

              {stage === "read" && (
                <>
                  <ChoiceGrid choices={COVERAGES} picked={picked} correctId={scenario.cov.id} onPick={handlePickCoverage} display="label" />
                  <div className="mt-5 min-h-[140px]">
                    {idAnswered && (
                      <FeedbackCard correct={idCorrect} title={`${idCorrect ? "Correct read" : "Not quite"} — it was ${scenario.cov.label}`} sub={scenario.cov.sub}>
                        <p className="text-sm opacity-90"><span className="opacity-60 uppercase text-xs tracking-wide mr-2">Tell</span>{scenario.cov.tell}</p>
                        <NextButton onClick={goToAttack} label="Step 3: call the attack →" />
                      </FeedbackCard>
                    )}
                    {!idAnswered && <p className="text-sm opacity-60 ct-mono">Count the deep defenders, then call the coverage.</p>}
                  </div>
                </>
              )}

              {stage === "attack" && attackChoices && (
                <>
                  <p className="ct-step mb-2" style={{ color: "#C9A24B" }}>WHERE DO YOU ATTACK {scenario.cov.label.toUpperCase()}?</p>
                  <ChoiceGrid choices={attackChoices} picked={attackPicked} correctId={scenario.cov.id} onPick={handlePickAttack} cols="grid-cols-1 sm:grid-cols-2" />
                  <div className="mt-5 min-h-[140px]">
                    {atkAnswered && (
                      <FeedbackCard correct={atkCorrect} title={atkCorrect ? "Correct attack" : "Not quite"}>
                        <p className="text-sm opacity-90"><span className="opacity-60 uppercase text-xs tracking-wide mr-2">Why</span>{scenario.cov.weakness}</p>
                        <NextButton onClick={next} label="Next read →" />
                      </FeedbackCard>
                    )}
                    {!atkAnswered && <p className="text-sm opacity-60 ct-mono">Pick the spot on the field this coverage struggles to defend.</p>}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {mode === "disguise" && (
          <>
            <div className="flex gap-4 ct-mono text-sm flex-wrap mb-3">
              <Stat label="Shell ID" score={dIdScore} />
              <Stat label="The Crack" score={dCrackScore} />
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide opacity-60">Streak</div>
                <div className="text-lg" style={{ color: "#C9A24B" }}>{dStreak}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div className="rounded-lg overflow-hidden border relative" style={{ borderColor: "rgba(201,162,75,0.35)", background: "#0B4030" }}>
                <div className="absolute top-2 left-2 z-10 ct-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded"
                  style={{ background: dStage === "shown" ? "rgba(201,162,75,0.85)" : "rgba(193,67,46,0.85)", color: dStage === "shown" ? "#0F3D2E" : "#EDE6D6" }}>
                  {dStage === "shown" ? "Pre-snap (shown)" : "Post-snap (played)"}
                </div>
                <Field offense={STATIC_OFFENSE} dots={dDots} showRoofline={dStage !== "shown"} />
              </div>
              <RotationSidebar perRotation={perRotation} />
            </div>

            <div className="mt-5">
              {dStage === "shown" && (
                <div>
                  <button onClick={snapIt} className="ct-btn ct-display rounded-md px-5 py-3 text-sm font-semibold border"
                    style={{ borderColor: "#C9A24B", background: "rgba(201,162,75,0.15)", color: "#EDE6D6" }}>
                    Snap it →
                  </button>
                  <p className="text-sm opacity-60 ct-mono mt-3">Note the shown shell, then snap it and watch the rotation.</p>
                </div>
              )}

              {dStage === "played-id" && (
                <>
                  <p className="ct-step opacity-60 mb-2">WHAT DID IT ROTATE INTO?</p>
                  <ChoiceGrid choices={COVERAGES} picked={dPicked} correctId={dScenario.played.id} onPick={handlePickPlayed} display="label" />
                  <div className="mt-5 min-h-[140px]">
                    {dIdAnswered && (
                      <FeedbackCard correct={dIdCorrect} title={`${dIdCorrect ? "Correct" : "Not quite"} — it rotated into ${dScenario.played.label}`} sub={`Shown as ${dScenario.shown.label}`}>
                        <p className="text-sm opacity-90"><span className="opacity-60 uppercase text-xs tracking-wide mr-2">Tell</span>{dScenario.played.tell}</p>
                        <NextButton onClick={goToCrack} label="Find the crack →" />
                      </FeedbackCard>
                    )}
                    {!dIdAnswered && <p className="text-sm opacity-60 ct-mono">Read the final shell, not the one it showed you.</p>}
                  </div>
                </>
              )}

              {dStage === "crack" && crackChoices && (
                <>
                  <p className="ct-step mb-2" style={{ color: "#C9A24B" }}>WHERE'S THE ROTATION CRACK?</p>
                  <ChoiceGrid choices={crackChoices} picked={crackPicked} correctId={dScenario.played.id} onPick={handlePickCrack} cols="grid-cols-1" />
                  <div className="mt-5 min-h-[140px]">
                    {crackAnswered && (
                      <FeedbackCard correct={crackCorrect} title={crackCorrect ? "Correct crack" : "Not quite"}>
                        <p className="text-sm opacity-90">
                          <span className="opacity-60 uppercase text-xs tracking-wide mr-2">Recap</span>
                          {dScenario.shown.label} shown → {dScenario.played.label} played
                        </p>
                        <NextButton onClick={dNext} label="Next rep →" />
                      </FeedbackCard>
                    )}
                    {!crackAnswered && <p className="text-sm opacity-60 ct-mono">Where the rotation came from usually matters more than where it ended up.</p>}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, score }) {
  const acc = score.total ? Math.round((score.right / score.total) * 100) : null;
  return (
    <div className="text-right">
      <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
      <div className="text-lg" style={{ color: "#C9A24B" }}>
        {score.right}/{score.total}
        {acc !== null && <span className="opacity-60 text-sm"> ({acc}%)</span>}
      </div>
    </div>
  );
}

function FeedbackCard({ correct, title, sub, children }) {
  return (
    <div className="ct-fade-in rounded-lg p-4 border" style={{ borderColor: correct ? "rgba(201,162,75,0.5)" : "rgba(193,67,46,0.5)", background: "rgba(11,64,48,0.6)" }}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="ct-display text-lg font-semibold" style={{ color: correct ? "#C9A24B" : "#E07A63" }}>{title}</span>
        {sub && <span className="ct-mono text-xs opacity-60">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function NextButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="ct-btn ct-display mt-4 rounded-md px-5 py-2 text-sm font-semibold" style={{ background: "#C9A24B", color: "#0F3D2E" }}>
      {label}
    </button>
  );
}

function Sidebar({ perCoverage }) {
  return (
    <aside className="rounded-lg p-4 border ct-mono text-xs" style={{ borderColor: "rgba(201,162,75,0.35)", background: "rgba(11,64,48,0.6)" }}>
      <div className="uppercase tracking-wide opacity-60 mb-3">Accuracy by shell</div>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-2 gap-y-2 items-center">
        <span></span>
        <span className="opacity-50 text-[9px]">M/Z</span>
        <span className="opacity-50 text-[9px]">Read</span>
        <span className="opacity-50 text-[9px]">Atk</span>
        {COVERAGES.map((c) => {
          const s = perCoverage[c.id];
          const mz = s.mzTotal ? Math.round((s.mzRight / s.mzTotal) * 100) : null;
          const idp = s.idTotal ? Math.round((s.idRight / s.idTotal) * 100) : null;
          const ap = s.atkTotal ? Math.round((s.atkRight / s.atkTotal) * 100) : null;
          return (
            <Fragment key={c.id}>
              <span style={{ color: "#EDE6D6" }}>{c.label.replace("Cover ", "C")}</span>
              <span style={{ color: mz === null ? "rgba(237,230,214,0.35)" : "#8FB7A8" }}>{mz === null ? "—" : `${mz}%`}</span>
              <span style={{ color: idp === null ? "rgba(237,230,214,0.35)" : "#C9A24B" }}>{idp === null ? "—" : `${idp}%`}</span>
              <span style={{ color: ap === null ? "rgba(237,230,214,0.35)" : "#E07A63" }}>{ap === null ? "—" : `${ap}%`}</span>
            </Fragment>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(201,162,75,0.25)" }}>
        <div className="uppercase tracking-wide opacity-60 mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#EDE6D6" }} /><span>Offense</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#C1432E" }} /><span>Defense (C/S/N/L)</span>
        </div>
      </div>
    </aside>
  );
}

function RotationSidebar({ perRotation }) {
  return (
    <aside className="rounded-lg p-4 border ct-mono text-xs" style={{ borderColor: "rgba(201,162,75,0.35)", background: "rgba(11,64,48,0.6)" }}>
      <div className="uppercase tracking-wide opacity-60 mb-3">Accuracy by final shell</div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-2 items-center">
        <span></span>
        <span className="opacity-50 text-[9px]">Shell ID</span>
        <span className="opacity-50 text-[9px]">Crack</span>
        {["c1", "c2", "c3", "c4"].map((id) => {
          const cov = COVERAGES.find((c) => c.id === id);
          const s = perRotation[id];
          const idp = s.idTotal ? Math.round((s.idRight / s.idTotal) * 100) : null;
          const cp = s.crackTotal ? Math.round((s.crackRight / s.crackTotal) * 100) : null;
          return (
            <Fragment key={id}>
              <span style={{ color: "#EDE6D6" }}>{cov.label.replace("Cover ", "C")}</span>
              <span style={{ color: idp === null ? "rgba(237,230,214,0.35)" : "#C9A24B" }}>{idp === null ? "—" : `${idp}%`}</span>
              <span style={{ color: cp === null ? "rgba(237,230,214,0.35)" : "#E07A63" }}>{cp === null ? "—" : `${cp}%`}</span>
            </Fragment>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t text-[10.5px] leading-relaxed opacity-70" style={{ borderColor: "rgba(201,162,75,0.25)" }}>
        The defense shows one shell pre-snap, then rotates into the real one at the snap. Read the final shape, then find where the rotation left a hole.
      </div>
    </aside>
  );
}
