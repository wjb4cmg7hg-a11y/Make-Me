import { useEffect, useRef, useCallback, useState, useMemo } from "react";
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
  selectedEditKey: PointKey | null;
  onKeySelect: (key: PointKey | null) => void;
  onDragStart: (key: PointKey) => void;
  onPointsChange: (updated: KeyPointPositions) => void;
  onPointDrop: (key: PointKey, x: number, y: number) => void;
}

const DOT_RADIUS = 6;
const HIT_RADIUS = 18;
const DRAG_THRESHOLD = 5; // px in canvas space before we consider it a drag

// ── Drawing helpers ──────────────────────────────────────────────────────────

function drawDoubleArrow(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  bx: number, by: number,
  color: string,
  lineWidth: number,
) {
  const angle = Math.atan2(by - ay, bx - ax);
  const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
  const aSize = Math.min(9, len * 0.15);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  for (const [px2, py2, dir] of [[bx, by, 1], [ax, ay, -1]] as [number, number, number][]) {
    ctx.beginPath();
    ctx.moveTo(px2, py2);
    ctx.lineTo(
      px2 + dir * aSize * Math.cos(angle + 0.38 + Math.PI),
      py2 + dir * aSize * Math.sin(angle + 0.38 + Math.PI),
    );
    ctx.lineTo(
      px2 + dir * aSize * Math.cos(angle - 0.38 + Math.PI),
      py2 + dir * aSize * Math.sin(angle - 0.38 + Math.PI),
    );
    ctx.closePath();
    ctx.fill();
  }

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
  const perpX = -Math.sin(angle) * 14;
  const perpY = Math.cos(angle) * 14;
  const lx = mx + perpX - tw / 2;
  const ly = my + perpY;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
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
  const midAngle = (angle1 + angle2) / 2;
  const lx = vx + (r + 16) * Math.cos(midAngle);
  const ly = vy + (r + 16) * Math.sin(midAngle);
  ctx.font = "bold 11px Inter, sans-serif";
  const tw = ctx.measureText(label).width;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
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
  selectedEditKey,
  onKeySelect,
  onDragStart,
  onPointsChange,
  onPointDrop,
}: PointCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);

  const scaleRef = useRef(1);
  const kpRef    = useRef<KeyPointPositions>(keyPoints);
  const dragRef  = useRef<{ key: PointKey; startX: number; startY: number; moved: boolean } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<PointKey | null>(null);
  const hoveredKeyRef = useRef<PointKey | null>(null);

  useEffect(() => { kpRef.current = keyPoints; }, [keyPoints]);

  const diagramKeys = useMemo(() => {
    if (!activeDiagram) return null;
    return new Set<PointKey>([
      ...activeDiagram.lines.flatMap((l) => [l.from, l.to]),
      ...activeDiagram.angles.flatMap((a) => [a.vertex, a.arm1, a.arm2]),
    ]);
  }, [activeDiagram]);

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

    ctx.strokeStyle = activeDiagram
      ? "rgba(139,195,160,0.12)"
      : "rgba(139,195,160,0.28)";
    ctx.lineWidth = 0.7;
    for (const [a, b] of DRAW_CONNECTIONS) {
      const la = landmarks[a]; const lb = landmarks[b];
      if (!la || !lb) continue;
      ctx.beginPath();
      ctx.moveTo(la.x * W * scale, la.y * H * scale);
      ctx.lineTo(lb.x * W * scale, lb.y * H * scale);
      ctx.stroke();
    }

    if (activeDiagram) {
      const px = (key: PointKey) => {
        if (!kp[key]) {
          console.warn(`Missing keypoint: ${key} for diagram`);
          return { x: 0, y: 0 };
        }
        return { x: kp[key]!.x * scale, y: kp[key]!.y * scale };
      };
      for (const line of activeDiagram.lines) {
        const from = px(line.from); const to = px(line.to);
        const color = ROLE_COLOR[line.role];
        drawDoubleArrow(ctx, from.x, from.y, to.x, to.y, color, line.role === "ref" ? 1.5 : 2.5);
        if (line.label) {
          drawLineLabel(ctx, from.x, from.y, to.x, to.y, line.label, color);
        }
      }
      for (const ang of activeDiagram.angles) {
        const v = px(ang.vertex); const a1 = px(ang.arm1); const a2 = px(ang.arm2);
        drawAngleArc(ctx, v.x, v.y, a1.x, a1.y, a2.x, a2.y, "#a78bfa", ang.label);
      }
    }

    const keysToRender = editMode
      ? (diagramKeys ? Array.from(diagramKeys) : Object.keys(KEY_POINT_DEFS) as PointKey[])
      : (diagramKeys ? Array.from(diagramKeys) : []);

    for (const key of keysToRender) {
      const pt = kp[key];
      if (!pt) continue;
      const def = KEY_POINT_DEFS[key];
      const cx = pt.x * scale; const cy = pt.y * scale;

      if (editMode) {
        const isSelected = selectedEditKey === key;
        const isHovered  = hoveredKeyRef.current === key;
        const isDragging = dragRef.current?.key === key;
        const r = isDragging ? DOT_RADIUS + 3 : isSelected ? DOT_RADIUS + 2 : isHovered ? DOT_RADIUS + 1 : DOT_RADIUS;

        ctx.save();
        ctx.shadowColor = def.color;
        ctx.shadowBlur = isSelected ? 16 : isHovered || isDragging ? 10 : 4;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = def.color;
          ctx.globalAlpha = 0.4;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = def.color;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();

        if (isSelected || isHovered || isDragging) {
          const label = def.label;
          ctx.font = "bold 11px Inter, sans-serif";
          const tw = ctx.measureText(label).width;
          const lx = cx - tw / 2;
          const ly = cy - r - 14;
          ctx.fillStyle = "rgba(0,0,0,0.8)";
          ctx.beginPath();
          ctx.roundRect(lx - 5, ly - 11, tw + 10, 16, 4);
          ctx.fill();
          ctx.fillStyle = def.color;
          ctx.fillText(label, lx, ly);
        }
      } else { // Not edit mode, but diagram is active
        ctx.save();
        ctx.shadowColor = def.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = def.color; ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      }
    }
  }, [landmarks, imageWidth, imageHeight, editMode, activeDiagram, selectedEditKey, diagramKeys]);

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

  useEffect(() => { draw(); }, [keyPoints, editMode, activeDiagram, selectedEditKey, draw, hoveredKey]);

  const canvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const findNearest = useCallback((cx: number, cy: number): PointKey | null => {
    const scale = scaleRef.current;
    const kp = kpRef.current;
    let best: PointKey | null = null;
    let bestDist = HIT_RADIUS * HIT_RADIUS;

    const keysToTest = diagramKeys ? Array.from(diagramKeys) : Object.keys(KEY_POINT_DEFS) as PointKey[];

    for (const k of keysToTest) {
      const pt = kp[k];
      if (!pt) continue;
      const dx = pt.x * scale - cx;
      const dy = pt.y * scale - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) { bestDist = d2; best = k; }
    }
    return best;
  }, [diagramKeys]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editMode) return;
    const { x, y } = canvasPos(e);
    const nearest = findNearest(x, y);
    if (!nearest) return;
    dragRef.current = { key: nearest, startX: x, startY: y, moved: false };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [editMode, findNearest]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPos(e);
    if (dragRef.current) {
      const dx = x - dragRef.current.startX;
      const dy = y - dragRef.current.startY;
      if (!dragRef.current.moved && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        dragRef.current.moved = true;
        onDragStart(dragRef.current.key);
      }
      if (dragRef.current.moved) {
        const scale = scaleRef.current;
        kpRef.current = { ...kpRef.current, [dragRef.current.key]: { x: x / scale, y: y / scale } };
        draw();
      }
      e.preventDefault();
      return;
    }
    if (!editMode) return;
    const nearest = findNearest(x, y);
    if (nearest !== hoveredKeyRef.current) {
      hoveredKeyRef.current = nearest;
      setHoveredKey(nearest);
    }
  }, [editMode, draw, onDragStart, findNearest]);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    const { moved, key } = dragRef.current;
    if (moved) {
      onPointsChange({ ...kpRef.current });
    } else {
      onKeySelect(key === selectedEditKey ? null : key);
    }
    dragRef.current = null;
    draw();
  }, [onPointsChange, onKeySelect, selectedEditKey, draw]);

  const onPointerLeave = useCallback(() => {
    if (hoveredKeyRef.current !== null) {
      hoveredKeyRef.current = null;
      setHoveredKey(null);
    }
  }, []);

  const onDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const key = e.dataTransfer.getData("text/plain") as PointKey;
    const { x, y } = canvasPos(e);
    const scale = scaleRef.current;
    onPointDrop(key, x / scale, y / scale);
  };

  const onDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const cursor = editMode
    ? dragRef.current?.moved ? "grabbing" : hoveredKey ? "grab" : "crosshair"
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
        onDrop={onDrop}
        onDragOver={onDragOver}
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
