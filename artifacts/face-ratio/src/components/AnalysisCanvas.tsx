import { useEffect, useRef } from "react";
import type { Landmarks } from "../lib/landmarks";
import { DRAW_CONNECTIONS } from "../lib/ratios";

interface AnalysisCanvasProps {
  imageUrl: string;
  landmarks: Landmarks | null;
  imageWidth: number;
  imageHeight: number;
}

export function AnalysisCanvas({
  imageUrl,
  landmarks,
  imageWidth,
  imageHeight,
}: AnalysisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const maxW = container.clientWidth;
      const maxH = container.clientHeight;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;

      canvas.width = dw;
      canvas.height = dh;
      ctx.drawImage(img, 0, 0, dw, dh);

      if (!landmarks) return;

      const w = dw;
      const h = dh;

      // Draw mesh connections
      ctx.strokeStyle = "rgba(139, 195, 160, 0.35)";
      ctx.lineWidth = 0.7;
      for (const [a, b] of DRAW_CONNECTIONS) {
        const la = landmarks[a];
        const lb = landmarks[b];
        if (!la || !lb) continue;
        ctx.beginPath();
        ctx.moveTo(la.x * w, la.y * h);
        ctx.lineTo(lb.x * w, lb.y * h);
        ctx.stroke();
      }

      // Draw key landmark dots
      const keyIndices = [
        33, 133, 159, 145, 263, 362, 386, 374,
        469, 470, 471, 472, 474, 475, 476, 477,
        168, 9, 358, 129, 294, 64,
        0, 13, 14, 17, 61, 291,
        152, 234, 454, 172, 397,
        10, 103, 332, 127, 356,
      ];

      ctx.fillStyle = "#a8d8b8";
      for (const idx of keyIndices) {
        const lm = landmarks[idx];
        if (!lm) continue;
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  }, [imageUrl, landmarks, imageWidth, imageHeight]);

  const aspectRatio = imageHeight > 0 ? imageWidth / imageHeight : 1;

  return (
    <div ref={containerRef} className="canvas-container" style={{ aspectRatio }}>
      <canvas ref={canvasRef} className="canvas-el" />
    </div>
  );
}
