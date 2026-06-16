import { useState, useCallback, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadZone } from "./components/UploadZone";
import { AnalysisCanvas } from "./components/AnalysisCanvas";
import { RatioTable } from "./components/RatioTable";
import { detectFaceLandmarks } from "./lib/mediapipe";
import { computeRatios } from "./lib/ratios";
import type { RatioResult } from "./lib/ratios";
import type { Landmarks } from "./lib/landmarks";
import { RefreshCw, AlertCircle } from "lucide-react";

const queryClient = new QueryClient();

type AppState = "idle" | "loading" | "done" | "error";

function FaceAnalyzer() {
  const [state, setState] = useState<AppState>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageW, setImageW] = useState(0);
  const [imageH, setImageH] = useState(0);
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [results, setResults] = useState<RatioResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImage = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLandmarks(null);
    setResults([]);
    setErrorMsg("");
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
        const ratioResults = computeRatios(
          detection.landmarks,
          detection.imageWidth,
          detection.imageHeight,
        );
        setLandmarks(detection.landmarks);
        setResults(ratioResults);
        setState("done");
      } catch (err) {
        console.error(err);
        setErrorMsg("Analysis failed. Please try a different photo.");
        setState("error");
      }
    };
    img.onerror = () => {
      setErrorMsg("Could not load the image.");
      setState("error");
    };
  }, []);

  const reset = () => {
    setImageUrl(null);
    setLandmarks(null);
    setResults([]);
    setErrorMsg("");
    setState("idle");
  };

  const overallScore =
    results.length > 0
      ? (results.filter((r) => r.score === "ideal").length / results.length) * 100
      : 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__mark">⟨⟩</span>
            <span className="app-logo__name">FaceMetrics</span>
          </div>
          <p className="app-header__sub">
            AI facial ratio analysis — 24 measurements against golden ratio ideals
          </p>
          {state !== "idle" && (
            <button className="reset-btn" onClick={reset} type="button">
              <RefreshCw size={14} />
              New Photo
            </button>
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
                <li>Upload a frontal photo — your device's camera or Photos app</li>
                <li>AI detects 478 facial landmarks in real time, in your browser</li>
                <li>24 facial ratios are calculated and compared to research-based ideals</li>
              </ol>
              <p className="idle-info__disclaimer">
                All processing happens locally in your browser. No photo is uploaded to any server.
              </p>
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="loading-layout">
            <div className="loading-card">
              {imageUrl && (
                <img
                  ref={imgRef}
                  src={imageUrl}
                  className="loading-preview"
                  alt="Analyzing..."
                />
              )}
              <div className="loading-spinner" />
              <p className="loading-text">Detecting landmarks&hellip;</p>
              <p className="loading-sub">This may take a few seconds on first run while the AI model loads</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="error-layout">
            {imageUrl && (
              <img src={imageUrl} className="error-preview" alt="Failed" />
            )}
            <div className="error-card">
              <AlertCircle size={28} className="error-icon" />
              <p className="error-msg">{errorMsg}</p>
              <button className="upload-zone__btn" onClick={reset}>
                Try Another Photo
              </button>
            </div>
          </div>
        )}

        {state === "done" && imageUrl && (
          <div className="done-layout">
            <div className="done-left">
              <AnalysisCanvas
                imageUrl={imageUrl}
                landmarks={landmarks}
                imageWidth={imageW}
                imageHeight={imageH}
              />
            </div>
            <div className="done-right">
              <RatioTable results={results} overallScore={overallScore} />
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
