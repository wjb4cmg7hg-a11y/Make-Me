
import React from 'react';

interface NudgeControlProps {
  onNudge: (dx: number, dy: number) => void;
  onReset: () => void;
  pointLabel: string;
}

export function NudgeControl({ onNudge, onReset, pointLabel }: NudgeControlProps) {
  return (
    <div className="nudge-control">
      <div className="nudge-header">
        Nudge <strong>{pointLabel}</strong>
      </div>
      <div className="nudge-buttons">
        <div />
        <button onClick={() => onNudge(0, -1)} className="nudge-btn">↑</button>
        <div />
        <button onClick={() => onNudge(-1, 0)} className="nudge-btn">←</button>
        <button onClick={onReset} className="nudge-btn reset">⎌</button>
        <button onClick={() => onNudge(1, 0)} className="nudge-btn">→</button>
        <div />
        <button onClick={() => onNudge(0, 1)} className="nudge-btn">↓</button>
        <div />
      </div>
    </div>
  );
}
