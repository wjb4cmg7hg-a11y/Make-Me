import { useEffect, useRef, useCallback, useState } from "react";
import type { Landmarks } from "../lib/landmarks";
import type { KeyPointPositions, PointKey } from "../lib/keyPoints";
import { KEY_POINT_DEFS } from "../lib/keyPoints";
import { DRAW_CONNECTIONS } from "../lib/drawConnections";

interface PointCanvasProps {
  imageUrl: string;
  landmarks: Landmarks;
  keyPoints: KeyPointPositions;
  imageWidth: number;
  imageHeight: number;
  editMode: boolean;
  onPointsChange: (updated: KeyPointPositions) => void;
}

const DOT_RADIUS = 6;
const HIT_RADIUS = 16;

export function PointCanvas({
  imageUrl,
  landmarks,
  keyPoints,
  imageWidth,
  imageHeight,
  editMode,
  onPointsChange,
}: PointCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Scale from image coords → canvas display coords
  const scaleRef = useRef(1);
  // Current key point positions in image coords
  const kpRef = useRef<KeyPointPositions>(keyPoints);
  // Drag state
  const dragRef = useRef<{ key: PointKey; offX: number; offY: number } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<PointKey | null>(null);
  const hoveredKeyRef = useRef<PointKey | null>(null);

  // Keep refs in sync
  useEffect(() => { kpRef.current = keyPoints; }, [keyPoints]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const scale = scaleRef.current;
    const kp = kpRef.current;

    // Draw mesh (faint)
    ctx.strokeStyle = "rgba(139, 195, 160, 0.28)";
    ctx.lineWidth = 0.7;
    for (const [a, b] of DRAW_CONNECTIONS) {
      const la = landmarks[a];
      const lb = landmarks[b];
      if (!la || !lb) continue;
      ctx.beginPath();
      ctx.moveTo(la.x * imageWidth * scale, la.y * imageHeight * scale);
      ctx.lineTo(lb.x * imageWidth * scale, lb.y * imageHeight * scale);
      ctx.stroke();
    }

    if (!editMode) return;

    // Draw key points
    const keys = Object.keys(kp) as PointKey[];
    for (const key of keys) {
      const pt = kp[key];
      const def = KEY_POINT_DEFS[key];
      const cx = pt.x * scale;
      const cy = pt.y * scale;
      const isHovered = hoveredKeyRef.current === key;
      const isDragging = dragRef.current?.key === key;
      const r = isDragging ? DOT_RADIUS + 3 : isHovered ? DOT_RADIUS + 1 : DOT_RADIUS;

      // Shadow
      ctx.shadowColor = def.color;
      ctx.shadowBlur = isHovered || isDragging ? 10 : 4;

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Label on hover or drag
      if (isHovered || isDragging) {
        const label = def.label;
        ctx.font = `bold 11px Inter, sans-serif`;
        const tw = ctx.measureText(label).width;
        const px = cx - tw / 2;
        const py = cy - r - 14;

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.beginPath();
        ctx.roundRect(px - 5, py - 11, tw + 10, 16, 4);
        ctx.fill();

        ctx.fillStyle = def.color;
        ctx.fillText(label, px, py);
      }
    }
  }, [landmarks, imageWidth, imageHeight, editMode]);

  // Initialize canvas when image loads
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const img = new Image();
    img.src = imageUrl;
    imgRef.current = img;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = container.clientWidth;
      const scale = Math.min(maxW / imageWidth, 1);
      scaleRef.current = scale;
      canvas.width = Math.round(imageWidth * scale);
      canvas.height = Math.round(imageHeight * scale);
      draw();
    };
  }, [imageUrl, imageWidth, imageHeight, draw]);

  // Redraw when keyPoints or editMode change
  useEffect(() => {
    draw();
  }, [keyPoints, editMode, draw, hoveredKey]);

  // Helper: canvas-local coords from pointer event
  const canvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Find nearest key point in canvas coords
  const findNearest = (cx: number, cy: number): PointKey | null => {
    const scale = scaleRef.current;
    const kp = kpRef.current;
    let best: PointKey | null = null;
    let bestDist = HIT_RADIUS * HIT_RADIUS;

    for (const k of Object.keys(kp) as PointKey[]) {
      const pt = kp[k];
      const dx = pt.x * scale - cx;
      const dy = pt.y * scale - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        best = k;
      }
    }
    return best;
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editMode) return;
    const { x, y } = canvasPos(e);
    const nearest = findNearest(x, y);
    if (!nearest) return;
    dragRef.current = { key: nearest, offX: x, offY: y };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [editMode]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPos(e);

    if (dragRef.current) {
      // Dragging: update point in image coords
      const scale = scaleRef.current;
      const newPt = { x: x / scale, y: y / scale };
      kpRef.current = { ...kpRef.current, [dragRef.current.key]: newPt };
      draw();
      e.preventDefault();
      return;
    }

    if (!editMode) return;
    // Hover detection
    const nearest = findNearest(x, y);
    if (nearest !== hoveredKeyRef.current) {
      hoveredKeyRef.current = nearest;
      setHoveredKey(nearest);
    }
  }, [editMode, draw]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current) {
      onPointsChange({ ...kpRef.current });
      dragRef.current = null;
      draw();
    }
  }, [onPointsChange, draw]);

  const onPointerLeave = useCallback(() => {
    if (hoveredKeyRef.current !== null) {
      hoveredKeyRef.current = null;
      setHoveredKey(null);
    }
  }, []);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas-el"
        style={{ cursor: editMode ? (dragRef.current ? "grabbing" : hoveredKey ? "grab" : "crosshair") : "default", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
      {editMode && (
        <div className="canvas-legend">
          {(["forehead", "eyes", "nose", "mouth", "face"] as const).map((g) => (
            <span key={g} className="canvas-legend__item">
              <span className="canvas-legend__dot" style={{ background: g === "forehead" ? "#a78bfa" : g === "eyes" ? "#34d399" : g === "nose" ? "#fbbf24" : g === "mouth" ? "#f472b6" : "#60a5fa" }} />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
