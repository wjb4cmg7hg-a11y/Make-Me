import type { RatioResult } from "../lib/ratios";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface RatioTableProps {
  results: RatioResult[];
  overallScore: number;
}

function ScoreIcon({ score }: { score: RatioResult["score"] }) {
  if (score === "ideal")
    return <CheckCircle2 size={15} className="score-icon score-icon--ideal" />;
  if (score === "close")
    return <AlertTriangle size={15} className="score-icon score-icon--close" />;
  return <XCircle size={15} className="score-icon score-icon--off" />;
}

function RatioBar({ result }: { result: RatioResult }) {
  const { value, ideal, unit } = result;
  if (value === null) return null;

  const range = ideal.max - ideal.min;
  const pad = range * 0.5;
  const visMin = ideal.min - pad;
  const visMax = ideal.max + pad;
  const visRange = visMax - visMin;

  const idealStartPct = ((ideal.min - visMin) / visRange) * 100;
  const idealWidthPct = (range / visRange) * 100;

  const valuePct = Math.max(0, Math.min(100, ((value - visMin) / visRange) * 100));

  return (
    <div className="ratio-bar-wrap">
      <div className="ratio-bar">
        <div
          className="ratio-bar__ideal"
          style={{ left: `${idealStartPct}%`, width: `${idealWidthPct}%` }}
        />
        <div
          className={`ratio-bar__marker ratio-bar__marker--${result.score}`}
          style={{ left: `${valuePct}%` }}
        />
      </div>
      <div className="ratio-bar__labels">
        <span>{idealRange(ideal, unit)}</span>
      </div>
    </div>
  );
}

function idealRange(ideal: RatioResult["ideal"], unit: string): string {
  if (unit === "°") return `${ideal.min}°–${ideal.max}°`;
  if (unit === "%") return `${ideal.min}–${ideal.max}%`;
  if (unit === "% dev") return `avg dev ≤${ideal.max}%`;
  return `${ideal.min}–${ideal.max}`;
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return "—";
  if (unit === "°") return `${value.toFixed(1)}°`;
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "% dev") return `${value.toFixed(1)}% dev`;
  return value.toFixed(2);
}

export function RatioTable({ results, overallScore }: RatioTableProps) {
  const idealCount = results.filter((r) => r.score === "ideal").length;
  const closeCount = results.filter((r) => r.score === "close").length;
  const offCount = results.filter((r) => r.score === "off").length;

  return (
    <div className="results-panel">
      <div className="results-summary">
        <div className="results-summary__score">
          <span className="results-summary__pct">{Math.round(overallScore)}%</span>
          <span className="results-summary__label">Overall Match</span>
        </div>
        <div className="results-summary__breakdown">
          <div className="breakdown-chip breakdown-chip--ideal">
            <CheckCircle2 size={13} />
            <span>{idealCount} Ideal</span>
          </div>
          <div className="breakdown-chip breakdown-chip--close">
            <AlertTriangle size={13} />
            <span>{closeCount} Close</span>
          </div>
          <div className="breakdown-chip breakdown-chip--off">
            <XCircle size={13} />
            <span>{offCount} Off</span>
          </div>
        </div>
      </div>

      <div className="ratio-list">
        {results.map((r) => (
          <div key={r.key} className={`ratio-card ratio-card--${r.score}`}>
            <div className="ratio-card__header">
              <div className="ratio-card__name-row">
                <ScoreIcon score={r.score} />
                <span className="ratio-card__name">{r.name}</span>
                <span className="ratio-card__abbr">{r.abbr}</span>
              </div>
              <div className="ratio-card__value-row">
                <span className={`ratio-card__value ratio-card__value--${r.score}`}>
                  {formatValue(r.value, r.unit)}
                </span>
                <span className="ratio-card__ideal-label">
                  ideal {idealRange(r.ideal, r.unit)}
                </span>
              </div>
            </div>
            <RatioBar result={r} />
            <p className="ratio-card__desc">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
