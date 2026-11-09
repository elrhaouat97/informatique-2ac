"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  Gamepad2,
  Home,
  Network,
  RotateCcw,
  Sheet,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { publicAsset } from "../../lib/public-assets";
import { gamePacks, type GamePack, type GameQuestion, type LT } from "./games-data";
import "./jeux.css";

/* ---------- helpers ---------- */

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Bi({ text, className }: { text: LT; className?: string }) {
  return (
    <span className={className}>
      <span className="jx-fr">{text.fr}</span>
      <span className="jx-ar" dir="rtl">{text.ar}</span>
    </span>
  );
}

function ExcelDiagram() {
  const cols = ["", "A", "B", "C", "D"];
  const values: Record<string, string> = { A1: "5", B1: "12", C1: "8", A2: "7", B2: "20", C2: "3", A3: "9", B3: "4", C3: "11" };
  return (
    <div className="jx-excel" role="img" aria-label="Tableau Excel avec la cellule B2 coloriée">
      {cols.map((c) => (
        <div key={`h-${c}`} className="jx-excel-head">{c}</div>
      ))}
      {[1, 2, 3].map((row) => (
        <Fragment key={`row-${row}`}>
          <div className="jx-excel-head">{row}</div>
          {["A", "B", "C", "D"].map((col) => {
            const addr = `${col}${row}`;
            return (
              <div key={addr} className={`jx-excel-cell ${addr === "B2" ? "active" : ""}`}>
                {values[addr] ?? ""}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

function Stimulus({ img, diagram }: { img?: string; diagram?: "excel" }) {
  if (diagram === "excel") return <div className="jx-stimulus jx-stimulus-diagram"><ExcelDiagram /></div>;
  if (!img) return null;
  return (
    <div className="jx-stimulus">
      <img src={publicAsset(img)} alt="" />
    </div>
  );
}

/* ---------- question views ---------- */

type DoneFn = (correct: boolean) => void;

function ChoiceView({ q, seed, onDone }: { q: Extract<GameQuestion, { kind: "choice" }>; seed: number; onDone: DoneFn }) {
  const options = useMemo(
    () => shuffled(q.options.map((o, i) => ({ ...o, correct: i === q.answer })), seed),
    [q, seed],
  );
  const [picked, setPicked] = useState<number | null>(null);
  const imageMode = options.some((o) => o.img);
  return (
    <div className="jx-q">
      <Stimulus img={q.img} diagram={q.diagram} />
      <Bi text={q.prompt} className="jx-prompt" />
      <div className={`jx-options ${imageMode ? "images" : ""}`}>
        {options.map((o, i) => {
          const state = picked === null ? "" : o.correct ? "right" : picked === i ? "wrong" : "dim";
          return (
            <button
              key={i}
              className={`jx-option ${imageMode ? "img" : ""} ${state}`}
              disabled={picked !== null}
              onClick={() => { setPicked(i); onDone(o.correct); }}
            >
              {o.img ? <img src={publicAsset(o.img)} alt="" /> : o.text ? <Bi text={o.text} className="jx-option-text" /> : null}
              {picked !== null && o.correct && <span className="jx-option-badge"><Check size={18} /></span>}
              {picked === i && !o.correct && <span className="jx-option-badge bad"><X size={18} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalseView({ q, onDone }: { q: Extract<GameQuestion, { kind: "tf" }>; onDone: DoneFn }) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const btn = (value: boolean, fr: string, ar: string, icon: React.ReactNode) => {
    const state = picked === null ? "" : value === q.answer ? "right" : picked === value ? "wrong" : "dim";
    return (
      <button
        className={`jx-tf ${state}`}
        disabled={picked !== null}
        onClick={() => { setPicked(value); onDone(value === q.answer); }}
      >
        {icon}
        <span className="jx-fr">{fr}</span>
        <span className="jx-ar" dir="rtl">{ar}</span>
      </button>
    );
  };
  return (
    <div className="jx-q">
      <Stimulus img={q.img} diagram={q.diagram} />
      <Bi text={q.prompt} className="jx-prompt" />
      <div className="jx-tf-row">
        {btn(true, "Vrai", "صحيح", <Check size={30} />)}
        {btn(false, "Faux", "خاطئ", <X size={30} />)}
      </div>
    </div>
  );
}

function FlashView({ q, onDone }: { q: Extract<GameQuestion, { kind: "flash" }>; onDone: DoneFn }) {
  const [flipped, setFlipped] = useState(false);
  const [marked, setMarked] = useState<boolean | null>(null);
  return (
    <div className="jx-q">
      <p className="jx-prompt">
        <span className="jx-fr">Carte mémoire — touche pour retourner</span>
        <span className="jx-ar" dir="rtl">بطاقة ذاكرة — اضغط لقلبها</span>
      </p>
      <button className={`jx-flash ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(true)} aria-label="Retourner la carte">
        <span className="jx-flash-inner">
          <span className="jx-flash-face front">
            {q.img && <img src={publicAsset(q.img)} alt="" />}
            <Bi text={q.front} className="jx-flash-title" />
            <span className="jx-flash-hint"><RotateCcw size={16} /> …</span>
          </span>
          <span className="jx-flash-face back">
            <Bi text={q.back} className="jx-flash-back-text" />
          </span>
        </span>
      </button>
      {flipped && marked === null && (
        <div className="jx-flash-actions">
          <button className="jx-know" onClick={() => { setMarked(true); onDone(true); }}>
            <Check size={20} /><span className="jx-fr">Je sais !</span><span className="jx-ar" dir="rtl">أعرفها</span>
          </button>
          <button className="jx-review" onClick={() => { setMarked(false); onDone(false); }}>
            <RotateCcw size={20} /><span className="jx-fr">À revoir</span><span className="jx-ar" dir="rtl">أعيد مراجعتها</span>
          </button>
        </div>
      )}
    </div>
  );
}

function OrderView({ q, seed, onDone }: { q: Extract<GameQuestion, { kind: "order" }>; seed: number; onDone: DoneFn }) {
  const pool = useMemo(() => shuffled(q.items.map((_, i) => i), seed + 7), [q, seed]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const remaining = pool.filter((i) => !placed.includes(i));
  const full = placed.length === q.items.length;
  return (
    <div className="jx-q">
      <Stimulus img={q.img} diagram={q.diagram} />
      <Bi text={q.prompt} className="jx-prompt" />
      <div className="jx-order-zone">
        {placed.map((itemIdx, pos) => (
          <button
            key={itemIdx}
            className={`jx-chip placed ${checked === null ? "" : itemIdx === pos ? "right" : "wrong"}`}
            disabled={checked !== null}
            onClick={() => setPlaced(placed.filter((p) => p !== itemIdx))}
          >
            <span className="jx-chip-num">{pos + 1}</span>
            <Bi text={q.items[itemIdx]} className="jx-chip-text" />
          </button>
        ))}
        {Array.from({ length: q.items.length - placed.length }).map((_, i) => (
          <div key={`slot-${i}`} className="jx-chip slot"><span className="jx-chip-num">{placed.length + i + 1}</span><span className="jx-chip-dots">… … …</span></div>
        ))}
      </div>
      <div className="jx-order-pool">
        {remaining.map((itemIdx) => (
          <button key={itemIdx} className="jx-chip pool" disabled={checked !== null} onClick={() => setPlaced([...placed, itemIdx])}>
            <Bi text={q.items[itemIdx]} className="jx-chip-text" />
          </button>
        ))}
      </div>
      {checked === null && (
        <button className="jx-check-btn" disabled={!full} onClick={() => { const ok = placed.every((v, i) => v === i); setChecked(ok); onDone(ok); }}>
          <Check size={20} /><span className="jx-fr">Vérifier</span><span className="jx-ar" dir="rtl">تحقق</span>
        </button>
      )}
    </div>
  );
}

function MatchView({ q, seed, onDone }: { q: Extract<GameQuestion, { kind: "match" }>; seed: number; onDone: DoneFn }) {
  const lefts = useMemo(() => shuffled(q.pairs.map((_, i) => i), seed + 11), [q, seed]);
  const rights = useMemo(() => shuffled(q.pairs.map((_, i) => i), seed + 23), [q, seed]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const doneRef = useMemo(() => ({ fired: false }), [q]);

  function tapRight(pairIdx: number) {
    if (sel === null || matched.has(pairIdx)) return;
    if (pairIdx === sel) {
      const next = new Set(matched);
      next.add(pairIdx);
      setMatched(next);
      setSel(null);
      if (next.size === q.pairs.length && !doneRef.fired) {
        doneRef.fired = true;
        onDone(mistakes <= 1);
      }
    } else {
      setMistakes(mistakes + 1);
      setWrong(pairIdx);
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <div className="jx-q">
      <Bi text={q.prompt} className="jx-prompt" />
      <div className="jx-match">
        <div className="jx-match-col">
          {lefts.map((pairIdx) => {
            const p = q.pairs[pairIdx];
            const isMatched = matched.has(pairIdx);
            return (
              <button
                key={pairIdx}
                className={`jx-match-item left ${sel === pairIdx ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                disabled={isMatched}
                onClick={() => setSel(pairIdx)}
              >
                {p.leftImg ? <img src={publicAsset(p.leftImg)} alt="" /> : p.leftText ? <Bi text={p.leftText} className="jx-match-text" /> : null}
                {isMatched && <span className="jx-option-badge"><Check size={16} /></span>}
              </button>
            );
          })}
        </div>
        <div className="jx-match-col">
          {rights.map((pairIdx) => {
            const p = q.pairs[pairIdx];
            const isMatched = matched.has(pairIdx);
            return (
              <button
                key={pairIdx}
                className={`jx-match-item right ${isMatched ? "matched" : ""} ${wrong === pairIdx ? "wrong" : ""}`}
                disabled={isMatched}
                onClick={() => tapRight(pairIdx)}
              >
                <Bi text={p.right} className="jx-match-text" />
                {isMatched && <span className="jx-option-badge"><Check size={16} /></span>}
              </button>
            );
          })}
        </div>
      </div>
      <p className="jx-match-progress">{matched.size} / {q.pairs.length}</p>
    </div>
  );
}

/* ---------- player ---------- */

const kindLabels: Record<GameQuestion["kind"], LT> = {
  choice: { fr: "Choisis la bonne réponse", ar: "اختر الجواب الصحيح" },
  flash: { fr: "Carte mémoire", ar: "بطاقة ذاكرة" },
  order: { fr: "Remets dans l'ordre", ar: "رتّب بالترتيب" },
  match: { fr: "Relie les paires", ar: "اربط الأزواج" },
  tf: { fr: "Vrai ou faux ?", ar: "صحيح أم خاطئ؟" },
};

function explainOf(q: GameQuestion): LT | null {
  return q.kind === "flash" ? null : q.explain;
}

function Player({ pack, packIndex, onExit }: { pack: GamePack; packIndex: number; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const total = pack.questions.length;
  const q = pack.questions[index];

  useEffect(() => {
    if (finished) {
      try {
        const key = "lab2ac-jeux-best";
        const best = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, number>;
        if ((best[pack.id] ?? -1) < score) {
          best[pack.id] = score;
          localStorage.setItem(key, JSON.stringify(best));
        }
      } catch { /* stockage indisponible */ }
    }
  }, [finished, pack.id, score]);

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const stars = pct >= 85 ? 3 : pct >= 60 ? 2 : pct >= 35 ? 1 : 0;
    return (
      <div className="jx-end">
        <Trophy size={64} className="jx-end-trophy" />
        <div className="jx-end-stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={44} className={i < stars ? "on" : "off"} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
        <h2 className="jx-end-score">{score} / {total}</h2>
        <p className="jx-end-msg">
          <span className="jx-fr">{pct >= 85 ? "Excellent, champion !" : pct >= 60 ? "Très bien, continue !" : pct >= 35 ? "Bon début, rejoue pour progresser !" : "Courage, rejoue et apprends !"}</span>
          <span className="jx-ar" dir="rtl">{pct >= 85 ? "ممتاز، يا بطل!" : pct >= 60 ? "جيّد جدًا، واصل!" : pct >= 35 ? "بداية جيدة، أعد اللعب لتتقدّم!" : "لا بأس، أعد اللعب وتعلّم!"}</span>
        </p>
        <div className="jx-end-actions">
          <button className="jx-btn primary" onClick={() => { setIndex(0); setScore(0); setResult(null); setFinished(false); }}>
            <RotateCcw size={19} /><span className="jx-fr">Rejouer</span><span className="jx-ar" dir="rtl">العب مجددًا</span>
          </button>
          <button className="jx-btn" onClick={onExit}>
            <Gamepad2 size={19} /><span className="jx-fr">Autres jeux</span><span className="jx-ar" dir="rtl">ألعاب أخرى</span>
          </button>
          <Link className="jx-btn" href="/">
            <Home size={19} /><span className="jx-fr">Retour au cours</span><span className="jx-ar" dir="rtl">العودة إلى الدرس</span>
          </Link>
        </div>
      </div>
    );
  }

  const explain = result !== null ? explainOf(q) : null;

  return (
    <div className="jx-player">
      <header className="jx-player-head">
        <button className="jx-icon-btn" onClick={onExit} aria-label="Quitter le jeu"><X size={22} /></button>
        <div className="jx-progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          {pack.questions.map((_, i) => (
            <span key={i} className={`jx-seg ${i < index ? "done" : i === index ? "current" : ""}`} />
          ))}
        </div>
        <div className="jx-score-chip"><Star size={16} fill="currentColor" /> {score}</div>
      </header>

      <div className="jx-kind-row">
        <span className={`jx-kind unit-${pack.unit}`}><Bi text={kindLabels[q.kind]} className="jx-kind-label" /></span>
        <span className="jx-count">{index + 1} / {total}</span>
      </div>

      <div key={index} className="jx-stage">
        {q.kind === "choice" && <ChoiceView q={q} seed={packIndex * 101 + index * 17 + 3} onDone={setResult} />}
        {q.kind === "tf" && <TrueFalseView q={q} onDone={setResult} />}
        {q.kind === "flash" && <FlashView q={q} onDone={setResult} />}
        {q.kind === "order" && <OrderView q={q} seed={packIndex * 101 + index * 17 + 3} onDone={setResult} />}
        {q.kind === "match" && <MatchView q={q} seed={packIndex * 101 + index * 17 + 3} onDone={setResult} />}
      </div>

      {result !== null && (
        <div className={`jx-feedback ${result ? "good" : "bad"}`}>
          <div className="jx-feedback-head">
            {result ? <Check size={22} /> : <X size={22} />}
            <span className="jx-fr">{result ? "Bravo !" : "Pas tout à fait…"}</span>
            <span className="jx-ar" dir="rtl">{result ? "أحسنت!" : "ليس تمامًا…"}</span>
          </div>
          {explain && <Bi text={explain} className="jx-feedback-text" />}
          <button
            className="jx-btn primary next"
            onClick={() => {
              if (result) setScore(score + 1);
              if (index + 1 >= total) setFinished(true);
              else { setIndex(index + 1); setResult(null); }
            }}
          >
            <span className="jx-fr">{index + 1 >= total ? "Voir mon résultat" : "Suivant"}</span>
            <span className="jx-ar" dir="rtl">{index + 1 >= total ? "اعرض نتيجتي" : "التالي"}</span>
            <ArrowRight size={19} />
          </button>
        </div>
      )}
      {result === null && q.kind === "flash" && <div className="jx-foot-space" />}
    </div>
  );
}

/* ---------- hub ---------- */

const packIcons: Record<string, React.ReactNode> = {
  materiel: <Cpu size={34} />,
  systeme: <AppWindow size={34} />,
  reseau: <Network size={34} />,
  excel: <Sheet size={34} />,
};

export default function JeuxPage() {
  const [active, setActive] = useState<number | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    try { setBest(JSON.parse(localStorage.getItem("lab2ac-jeux-best") || "{}")); } catch { /* ignore */ }
  }, [active]);

  if (active !== null) {
    const pack = gamePacks[active];
    return (
      <main className={`jx-root unit-${pack.unit}`}>
        <Player pack={pack} packIndex={active} onExit={() => setActive(null)} />
      </main>
    );
  }

  return (
    <main className="jx-root">
      <div className="jx-hub">
        <Link href="/" className="jx-back"><ArrowLeft size={18} /><span>LAB·2AC</span></Link>
        <header className="jx-hub-head">
          <span className="jx-hub-icon"><Gamepad2 size={40} /></span>
          <h1>
            <span className="jx-fr">Jeux interactifs</span>
            <span className="jx-ar" dir="rtl">ألعاب تفاعلية</span>
          </h1>
          <p>
            <span className="jx-fr">Choisis un jeu, réponds question après question et gagne des étoiles !</span>
            <span className="jx-ar" dir="rtl">اختر لعبة، أجب سؤالًا بعد سؤال واربح النجوم!</span>
          </p>
        </header>
        <div className="jx-pack-grid">
          {gamePacks.map((pack, i) => {
            const b = best[pack.id];
            return (
              <button key={pack.id} className={`jx-pack unit-${pack.unit}`} onClick={() => setActive(i)}>
                <span className="jx-pack-icon">{packIcons[pack.id]}</span>
                <Bi text={pack.title} className="jx-pack-title" />
                <Bi text={pack.subtitle} className="jx-pack-sub" />
                <span className="jx-pack-meta">
                  <span>{pack.questions.length} questions · أسئلة</span>
                  {typeof b === "number" && <span className="jx-pack-best"><Star size={14} fill="currentColor" /> {b}/{pack.questions.length}</span>}
                </span>
                <span className="jx-pack-play"><span className="jx-fr">Jouer</span><span className="jx-ar" dir="rtl">العب</span><ArrowRight size={18} /></span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
