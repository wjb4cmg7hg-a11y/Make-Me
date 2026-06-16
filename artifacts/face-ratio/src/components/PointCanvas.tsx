import { useEffect, useRef, useCallback, useState } from "react";
import type { Landmarks } from "../lib/landmarks";
import type { KeyPointPositions, PointKey } from "../lib/keyPoints";
import { KEY_POINT_DEFS } from "../lib/keyPoints";
import { DRAW_CONNECTIONS } from "../lib/drawConnections";
import type { RatioDiagram } from "../lib/measurementDiagram";
import { ROLE_COLOR } from "../lib/measurementDiagram";

interface PointCanvasProps {
  imageUrl: string;
  landmarks: Landmarks;
  keyPoints: KeyPointPositions;
  imageWidth: number;
  imageHeight: number;
  editMode: boolean;
  activeDiagram: RatioDiagram | null;
  onPointsChange: (updated: KeyPointPositions) => void;
}

const DOT_RADIUS = 6;
const HIT_RADIUS = 16;

// ── Drawing helpers ──────────────────────────────────────────────────────────

function drawDoubleArrow(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  bx: number, by: number,
  color: string,
  lineWidth: number,
) {
  const angle = Math.atan2(by - ay, bx - ax);
  const aSize = Math.min(9, Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2) * 0.15);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  // Line
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  // Arrowhead at b
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx - aSize * Math.cos(angle - 0.38), by - aSize * Math.sin(angle - 0.38));
  ctx.lineTo(bx - aSize * Math.cos(angle + 0.38), by - aSize * Math.sin(angle + 0.38));
  ctx.closePath();
  ctx.fill();

  // Arrowhead at a
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + aSize * Math.cos(angle - 0.38 + Math.PI), ay + aSize * Math.sin(angle - 0.38 + Math.PI));
  ctx.lineTo(ax + aSize * Math.cos(angle + 0.38 + Math.PI), ay + aSize * Math.sin(angle + 0.38 + Math.PI));
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawLineLabel(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  bx: number, by: number,
  label: string,
  color: string,
) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const angle = Math.atan2(by - ay, bx - ax);

  ctx.save();
  ctx.font = "bold 11px Inter, sans-serif";
  const tw = ctx.measureText(label).width;

  // Offset label perpendicular to the line
  const perpX = -Math.sin(angle) * 14;
  const perpY = Math.cos(angle) * 14;
  const lx = mx + perpX - tw / 2;
  const ly = my + perpY;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.roundRect(lx - 4, ly - 11, tw + 8, 16, 3);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillText(label, lx, ly);
  ctx.restore();
}

function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  vx: number, vy: number,
  ax: number, ay: number,
  bx: number, by: number,
  color: string,
  label: string,
) {
  const angle1 = Math.atan2(ay - vy, ax - vx);
  const angle2 = Math.atan2(by - vy, bx - vx);
  const r = 24;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.arc(vx, vy, r, angle1, angle2, false);
  ctx.stroke();

  // Angle label at midpoint of arc
  const midAngle = (angle1 + angle2) / 2;
  const lx = vx + (r + 16) * Math.cos(midAngle);
  const ly = vy + (r + 16) * Math.sin(midAngle);

  ctx.font = "bold 11px Inter, sans-serif";
  const tw = ctx.measureText(label).width;

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.roundRect(lx - tw / 2 - 4, ly - 11, tw + 8, 16, 3);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillText(label, lx - tw / 2, ly);
  ctx.restore();
}

// ── Component ────────────────────────────────────────────────────────────────

export function PointCanvas({
  imageUrl,
  landmarks,
  keyPoints,
  imageWidth,
  imageHeight,
  editMode,
  activeDiagram,
  onPointsChange,
}: PointCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const scaleRef = useRef(1);
  const kpRef = useRef<KeyPointPositions>(keyPoints);
  const dragRef = useRef<{ key: PointKey } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<PointKey | null>(null);
  const hoveredKeyRef = useRef<PointKey | null>(null);

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
    const W = imageWidth;
    const H = imageHeight;

    // Mesh
    ctx.strokeStyle = activeDiagram
      ? "rgba(139,195,160,0.15)"
      : "rgba(139,195,160,0.28)";
    ctx.lineWidth = 0.7;
    for (const [a, b] of DRAW_CONNECTIONS) {
      const la = landmarks[a];
      const lb = landmarks[b];
      if (!la || !lb) continue;
      ctx.beginPath();
      ctx.moveTo(la.x * W * scale, la.y * H * scale);
      ctx.lineTo(lb.x * W * scale, lb.y * H * scale);
      ctx.stroke();
    }

    // ── Measurement diagram ─────────────────────────────────────
    if (activeDiagram) {
      const px = (key: PointKey) => ({
        x: kp[key].x * scale,
        y: kp[key].y * scale,
      });

      // Lines
      for (const line of activeDiagram.lines) {
        const from = px(line.from);
        const to   = px(line.to);
        const color = ROLE_COLOR[line.role];
        const lw = line.role === "ref" ? 1.5 : 2.5;
        drawDoubleArrow(ctx, from.x, from.y, to.x, to.y, color, lw);
        drawLineLabel(ctx, from.x, from.y, to.x, to.y, line.label, color);
      }

      // Angles
      for (const ang of activeDiagram.angles) {
        const v  = px(ang.vertex);
        const a1 = px(ang.arm1);
        const a2 = px(ang.arm2);
        drawAngleArc(ctx, v.x, v.y, a1.x, a1.y, a2.x, a2.y, "#a78bfa", ang.label);
      }

      // Highlight relevant key points
      const usedKeys = new Set<PointKey>([
        ...activeDiagram.lines.flatMap((l) => [l.from, l.to]),
        ...activeDiagram.angles.flatMap((a) => [a.vertex, a.arm1, a.arm2]),
      ]);
      for (const key of usedKeys) {
        const pt = kp[key];
        const def = KEY_POINT_DEFS[key];
        const cx = pt.x * scale;
        const cy = pt.y * scale;
        ctx.save();
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = def.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      return; // Skip edit-mode dots when showing diagram
    }

    // ── Edit mode dots ───────────────────────────────────────────
    if (!editMode) return;

    const keys = Object.keys(kp) as PointKey[];
    for (const key of keys) {
      const pt = kp[key];
      const def = KEY_POINT_DEFS[key];
      const cx = pt.x * scale;
      const cy = pt.y * scale;
      const isHovered  = hoveredKeyRef.current === key;
      const isDragging = dragRef.current?.key === key;
      const r = isDragging ? DOT_RADIUS + 3 : isHovered ? DOT_RADIUS + 1 : DOT_RADIUS;

      ctx.save();
      ctx.shadowColor = def.color;
      ctx.shadowBlur = isHovered || isDragging ? 10 : 4;

      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      if (isHovered || isDragging) {
        const label = def.label;
        ctx.font = "bold 11px Inter, sans-serif";
        const tw = ctx.measureText(label).width;
        const px2 = cx - tw / 2;
        const py2 = cy - r - 14;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.beginPath();
        ctx.roundRect(px2 - 5, py2 - 11, tw + 10, 16, 4);
        ctx.fill();
        ctx.fillStyle = def.color;
        ctx.fillText(label, px2, py2);
      }
    }
  }, [landmarks, imageWidth, imageHeight, editMode, activeDiagram]);

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
      canvas.width  = Math.round(imageWidth * scale);
      canvas.height = Math.round(imageHeight * scale);
      draw();
    };
  }, [imageUrl, imageWidth, imageHeight, draw]);

  useEffect(() => { draw(); }, [keyPoints, editMode, activeDiagram, draw, hoveredKey]);

  const canvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

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
      if (d2 < bestDist) { bestDist = d2; best = k; }
    }
    return best;
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editMode) return;
    const { x, y } = canvasPos(e);
    const nearest = findNearest(x, y);
    if (!nearest) return;
    dragRef.current = { key: nearest };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [editMode]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPos(e);
    if (dragRef.current) {
      const scale = scaleRef.current;
      kpRef.current = { ...kpRef.current, [dragRef.current.key]: { x: x / scale, y: y / scale } };
      draw();
      e.preventDefault();
      return;
    }
    if (!editMode) return;
    const nearest = findNearest(x, y);
    if (nearest !== hoveredKeyRef.current) {
      hoveredKeyRef.current = nearest;
      setHoveredKey(nearest);
    }
  }, [editMode, draw]);

  const onPointerUp = useCallback(() => {
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

  const cursor = editMode
    ? dragRef.current ? "grabbing" : hoveredKey ? "grab" : "crosshair"
    : "default";

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas-el"
        style={{ cursor, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
      {editMode && (
        <div className="canvas-legend">
          {(["forehead","eyes","nose","mouth","face"] as const).map((g) => (
            <span key={g} className="canvas-legend__item">
              <span className="canvas-legend__dot" style={{
                background: g === "forehead" ? "#a78bfa" : g === "eyes" ? "#34d399"
                  : g === "nose" ? "#fbbf24" : g === "mouth" ? "#f472b6" : "#60a5fa"
              }} />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
