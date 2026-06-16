import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadZone } from "./components/UploadZone";
import { PointCanvas } from "./components/PointCanvas";
import { RatioTable } from "./components/RatioTable";
import { detectFaceLandmarks } from "./lib/mediapipe";
import { computeRatios } from "./lib/ratios";
import { extractKeyPoints } from "./lib/keyPoints";
import { DIAGRAMS } from "./lib/measurementDiagram";
import type { KeyPointPositions } from "./lib/keyPoints";
import type { RatioResult } from "./lib/ratios";
import type { Landmarks } from "./lib/landmarks";
import { RefreshCw, AlertCircle, Crosshair } from "lucide-react";

const queryClient = new QueryClient();
type AppState = "idle" | "loading" | "done" | "error";

function FaceAnalyzer() {
  const [state, setState]         = useState<AppState>("idle");
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [imageW, setImageW]       = useState(0);
  const [imageH, setImageH]       = useState(0);
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [keyPoints, setKeyPoints] = useState<KeyPointPositions | null>(null);
  const [results, setResults]     = useState<RatioResult[]>([]);
  const [errorMsg, setErrorMsg]   = useState("");
  const [editMode, setEditMode]   = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const handleImage = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLandmarks(null);
    setKeyPoints(null);
    setResults([]);
    setErrorMsg("");
    setEditMode(false);
    setSelectedKey(null);
    setState("loading");

    const img = new Image();
    img.src = url;
    img.onload = async () => {
      setImageW(img.naturalWidth);
      setImageH(img.naturalHeight);
      try {
        const detection = await detectFaceLandmarks(img);
        if (!detection) {
          setErrorMsg("No face detected. Please use a clear frontal photo with good lighting.");
          setState("error");
          return;
        }
        const kp = extractKeyPoints(
          detection.landmarks,
          detection.imageWidth,
          detection.imageHeight,
        );
        setLandmarks(detection.landmarks);
        setKeyPoints(kp);
        setResults(computeRatios(kp));
        setState("done");
      } catch (err) {
        console.error(err);
        setErrorMsg("Analysis failed. Please try a different photo.");
        setState("error");
      }
    };
    img.onerror = () => { setErrorMsg("Could not load the image."); setState("error"); };
  }, []);

  const handlePointsChange = useCallback((updated: KeyPointPositions) => {
    setKeyPoints(updated);
    setResults(computeRatios(updated));
  }, []);

  const handleSelect = useCallback((key: string | null) => {
    setSelectedKey(key);
    if (key) setEditMode(false); // switch off edit mode when viewing a diagram
  }, []);

  const handleEditToggle = () => {
    setEditMode((v) => !v);
    if (!editMode) setSelectedKey(null); // clear diagram when entering edit mode
  };

  const reset = () => {
    setImageUrl(null); setLandmarks(null); setKeyPoints(null);
    setResults([]); setErrorMsg(""); setEditMode(false); setSelectedKey(null);
    setState("idle");
  };

  const overallScore = results.length > 0
    ? (results.filter((r) => r.score === "ideal").length / results.length) * 100
    : 0;

  const activeDiagram = selectedKey ? (DIAGRAMS[selectedKey] ?? null) : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__mark">⟨⟩</span>
            <span className="app-logo__name">FaceMetrics</span>
          </div>
          <p className="app-header__sub">
            AI facial ratio analysis — 24 measurements against research-based ideals
          </p>
          {state === "done" && (
            <div className="header-actions">
              <button
                className={`edit-btn ${editMode ? "edit-btn--active" : ""}`}
                onClick={handleEditToggle}
                type="button"
              >
                <Crosshair size={14} />
                {editMode ? "Done Adjusting" : "Adjust Points"}
              </button>
              <button className="reset-btn" onClick={reset} type="button">
                <RefreshCw size={14} />
                New Photo
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {state === "idle" && (
          <div className="idle-layout">
            <UploadZone onImageSelected={handleImage} />
            <div className="idle-info">
              <h3>How it works</h3>
              <ol>
                <li>Upload a frontal photo — your device camera or Photos app</li>
                <li>AI detects 478 facial landmarks entirely in your browser</li>
                <li>24 ratios are calculated and compared to research-based ideal ranges</li>
                <li>Tap any ratio card to see its measurement lines drawn on the photo</li>
                <li>Use "Adjust Points" to drag any landmark that landed in the wrong place</li>
              </ol>
              <p className="idle-info__disclaimer">
                All processing happens locally. No photo is ever uploaded to a server.
              </p>
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="loading-layout">
            <div className="loading-card">
              {imageUrl && <img src={imageUrl} className="loading-preview" alt="Analyzing..." />}
              <div className="loading-spinner" />
              <p className="loading-text">Detecting landmarks&hellip;</p>
              <p className="loading-sub">First run downloads the AI model (~6 MB) — subsequent photos are instant</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="error-layout">
            {imageUrl && <img src={imageUrl} className="error-preview" alt="Failed" />}
            <div className="error-card">
              <AlertCircle size={28} className="error-icon" />
              <p className="error-msg">{errorMsg}</p>
              <button className="upload-zone__btn" onClick={reset}>Try Another Photo</button>
            </div>
          </div>
        )}

        {state === "done" && imageUrl && landmarks && keyPoints && (
          <div className="done-layout">
            <div className="done-left">
              {editMode && (
                <div className="edit-hint">
                  <Crosshair size={13} />
                  Drag any colored dot to correct it — ratios update instantly
                </div>
              )}
              {selectedKey && activeDiagram && (
                <div className="diagram-hint">
                  <span className="diagram-hint__key">{selectedKey.toUpperCase()}</span>
                  {activeDiagram.formulaParts.map((p, i) => {
                    let style: React.CSSProperties = {};
                    if (p.role === "numerator") style.color = "#c9a96e";
                    else if (p.role === "denominator") style.color = "#60a5fa";
                    else if (p.role === "angle") style.color = "#a78bfa";
                    return <span key={i} style={style}>{p.text}</span>;
                  })}
                </div>
              )}
              <PointCanvas
                imageUrl={imageUrl}
                landmarks={landmarks}
                keyPoints={keyPoints}
                imageWidth={imageW}
                imageHeight={imageH}
                editMode={editMode}
                activeDiagram={activeDiagram}
                onPointsChange={handlePointsChange}
              />
            </div>
            <div className="done-right">
              <RatioTable
                results={results}
                overallScore={overallScore}
                selectedKey={selectedKey}
                onSelect={handleSelect}
                diagrams={DIAGRAMS}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FaceAnalyzer />
    </QueryClientProvider>
  );
}
