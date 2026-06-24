import type { RatioResult } from "../lib/ratios";
import { ROLE_COLOR, type MeasurementDiagram, type DiagramFormulaPart } from "../lib/measurementDiagram";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface RatioTableProps {
  results: RatioResult[];
  harmonyScore: number;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  diagrams: Record<string, MeasurementDiagram>;
}

type ScoreLevel = "ideal" | "close" | "off";

function getScoreLevel(score: number | null): ScoreLevel | "unknown" {
  if (score === null) return "unknown";
  if (score >= 9) return "ideal";
  if (score >= 7) return "close";
  return "off";
}

function ScoreIcon({ level }: { level: ScoreLevel | "unknown" }) {
  if (level === "ideal") return <CheckCircle2 size={14} className="score-icon score-icon--ideal" />;
  if (level === "close") return <AlertTriangle size={14} className="score-icon score-icon--close" />;
  if (level === "off") return <XCircle size={14} className="score-icon score-icon--off" />;
  return null;
}

function RatioBar({ result }: { result: RatioResult }) {
  const { value, ideal, score } = result;
  if (value === null) return null;
  const range  = ideal.max - ideal.min;
  const pad    = range * 0.5;
  const visMin = ideal.min - pad;
  const visMax = ideal.max + pad;
  const visRange = visMax - visMin;

  const idealStart = ((ideal.min - visMin) / visRange) * 100;
  const idealWidth = (range / visRange) * 100;
  const valuePct   = Math.max(0, Math.min(100, ((value - visMin) / visRange) * 100));
  const scoreLevel = getScoreLevel(score);

  return (
    <div className="ratio-bar">
      <div className="ratio-bar__ideal" style={{ left: `${idealStart}%`, width: `${idealWidth}%` }} />
      <div className={`ratio-bar__marker ratio-bar__marker--${scoreLevel}`} style={{ left: `${valuePct}%` }} />
    </div>
  );
}

function FormulaDisplay({ parts }: { parts: DiagramFormulaPart[] }) {
  return (
    <div className="formula-row">
      {parts.map((p, i) => {
        const style: React.CSSProperties = {
          color: ROLE_COLOR[p.role] || '#ffffff'
        };
        const cls = `formula-part formula-part--${p.role}`;
        return <span key={i} className={cls} style={style}>{p.text}</span>;
      })}
    </div>
  );
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return "—";
  if (unit === "°") return `${value.toFixed(1)}°`;
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "% dev") return `${value.toFixed(1)}% dev`;
  return value.toFixed(2);
}

function idealRange(ideal: RatioResult["ideal"], unit: string): string {
  if (unit === "°") return `${ideal.min}°–${ideal.max}°`;
  if (unit === "%") return `${ideal.min}–${ideal.max}%`;
  if (unit === "% dev") return `avg dev ≤${ideal.max}%`;
  return `${ideal.min}–${ideal.max}`;
}

export function RatioTable({ results, harmonyScore, selectedKey, onSelect, diagrams }: RatioTableProps) {
  const idealCount = results.filter((r) => getScoreLevel(r.score) === "ideal").length;
  const closeCount = results.filter((r) => getScoreLevel(r.score) === "close").length;
  const offCount   = results.filter((r) => getScoreLevel(r.score) === "off").length;

  return (
    <div className="results-panel">
      <div className="results-summary">
        <div className="results-summary__score">
          <span className="results-summary__pct">{Math.round(harmonyScore)}%</span>
          <span className="results-summary__label">Harmony Score</span>
        </div>
        <div className="results-summary__breakdown">
          <div className="breakdown-chip breakdown-chip--ideal"><CheckCircle2 size={13} /><span>{idealCount} Ideal</span></div>
          <div className="breakdown-chip breakdown-chip--close"><AlertTriangle size={13} /><span>{closeCount} Close</span></div>
          <div className="breakdown-chip breakdown-chip--off"><XCircle size={13} /><span>{offCount} Off</span></div>
        </div>
        <p className="results-summary__hint">Tap a ratio to see its measurement lines on the photo</p>
      </div>

      <div className="ratio-list">
        {results.map((r) => {
          const isSelected = selectedKey === r.key;
          const diagram = diagrams[r.key];
          const scoreLevel = getScoreLevel(r.score);
          return (
            <div
              key={r.key}
              className={`ratio-card ratio-card--${scoreLevel}${isSelected ? " ratio-card--selected" : ""}`}
              onClick={() => onSelect(isSelected ? null : r.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(isSelected ? null : r.key)}
            >
              <div className="ratio-card__header">
                <div className="ratio-card__name-row">
                  <ScoreIcon level={scoreLevel} />
                  <span className="ratio-card__name">{r.name}</span>
                  <span className="ratio-card__abbr">{r.abbr}</span>
                </div>
                <div className="ratio-card__value-row">
                  <span className={`ratio-card__value ratio-card__value--${scoreLevel}`}>
                    {formatValue(r.value, r.unit)}
                  </span>
                  <span className={`ratio-card__score ratio-card__score--${scoreLevel}`}>
                    {r.score !== null ? r.score.toFixed(1) : 'N/A'}
                  </span>
                  <span className="ratio-card__ideal-label">ideal {idealRange(r.ideal, r.unit)}</span>
                </div>
              </div>

              <RatioBar result={r} />

              {diagram && <FormulaDisplay parts={diagram.formulaParts} />}

              {isSelected && (
                <p className="ratio-card__desc">{r.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
