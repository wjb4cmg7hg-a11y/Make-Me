import React from 'react';

interface ScoreDisplayProps {
  score: "ideal" | "good" | "low" | "high";
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const scoreMap = {
    ideal: {
      label: "Ideal",
      color: "bg-green-100 text-green-800",
    },
    good: {
      label: "Good",
      color: "bg-blue-100 text-blue-800",
    },
    low: {
      label: "Low",
      color: "bg-yellow-100 text-yellow-800",
    },
    high: {
      label: "High",
      color: "bg-red-100 text-red-800",
    },
  };

  const { label, color } = scoreMap[score] || { label: score, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {label}
    </span>
  );
}
