import type { PointKey } from "./keyPoints";

export interface DiagramLine {
  from: PointKey;
  to: PointKey;
  color?: string;
  dashed?: boolean;
}

export interface DiagramAngle {
  p1: PointKey; // Endpoint 1
  p2: PointKey; // Vertex
  p3: PointKey; // Endpoint 2
  color?: string;
}

export interface DiagramFormulaPart {
  text: string;
  role: "numerator" | "denominator" | "operator" | "angle" | "label";
}

export interface MeasurementDiagram {
  lines: DiagramLine[];
  angles: DiagramAngle[];
  formulaParts: DiagramFormulaPart[];
}

export const ROLE_COLOR: Record<DiagramFormulaPart["role"], string> = {
    numerator: "#c9a96e",
    denominator: "#60a5fa",
    operator: "#ffffff",
    angle: "#a78bfa",
    label: "#ffffff",
};


// prettier-ignore
export const DIAGRAMS: Record<string, MeasurementDiagram> = {
  esr: {
    lines: [
      { from: "l_pupil", to: "r_pupil", color: "#c9a96e" },
      { from: "zygo_l", to: "zygo_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "ESR", role: "label" },
      { text: "=", role: "operator" },
      { text: "Interpupillary Distance", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
  },
  canthal: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#a78bfa" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#a78bfa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Canthal Tilt", role: "label" },
    ],
  },

  pfl: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#c9a96e" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#c9a96e" },
      { from: "zygo_l", to: "zygo_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "PFL", role: "label" },
      { text: "=", role: "operator" },
      { text: "Palpebral Fissure Length", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
  },

  iaa: {
    lines: [
      { from: "subnasale", to: "l_eye_lat", color: "#a78bfa" },
      { from: "subnasale", to: "r_eye_lat", color: "#a78bfa" },
    ],
    angles: [{ p1: "l_eye_lat", p2: "subnasale", p3: "r_eye_lat", color: "#a78bfa" }],
    formulaParts: [
      { text: "IAA", role: "label" },
      { text: "=", role: "operator" },
      { text: "Infraorbital Alar Angle", role: "angle" },
    ],
  },

  icd: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#c9a96e" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#c9a96e" },
      { from: "l_eye_med", to: "r_eye_med", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "ICD", role: "label" },
      { text: "=", role: "operator" },
      { text: "Eye Fissure Length", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Intercanthal Distance", role: "denominator" },
    ],
  },

  ear: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#c9a96e" },
      { from: "l_eye_top", to: "l_eye_bot", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "EAR", role: "label" },
      { text: "=", role: "operator" },
      { text: "Eye Fissure Length", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Eye Fissure Height", role: "denominator" },
    ],
  },

  eme: {
    lines: [
      { from: "lip_center", to: "l_pupil", color: "#a78bfa" },
      { from: "lip_center", to: "r_pupil", color: "#a78bfa" },
    ],
    angles: [{ p1: "l_pupil", p2: "lip_center", p3: "r_pupil", color: "#a78bfa" }],
    formulaParts: [
      { text: "EME", role: "label" },
      { text: "=", role: "operator" },
      { text: "Eye-Mouth-Eye Angle", role: "angle" },
    ],
  },

  jfa: {
    lines: [
      { from: "jaw_l", to: "jaw_apex", color: "#a78bfa" },
      { from: "jaw_r", to: "jaw_apex", color: "#a78bfa" },
    ],
    angles: [{ p1: "jaw_l", p2: "jaw_apex", p3: "jaw_r", color: "#a78bfa" }],
    formulaParts: [
      { text: "JFA", role: "label" },
      { text: "=", role: "operator" },
      { text: "Jaw Frontal Angle", role: "angle" },
    ],
  },

  lff: {
    lines: [
      { from: "nasion", to: "chin", color: "#c9a96e" },
      { from: "hairline", to: "chin", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "LFF", role: "label" },
      { text: "=", role: "operator" },
      { text: "Nasion to Chin", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Total Face Height", role: "denominator" },
    ],
  },

  jaww: {
    lines: [
      { from: "gonia_l", to: "gonia_r", color: "#c9a96e" },
      { from: "zygo_l", to: "zygo_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "JW", role: "label" },
      { text: "=", role: "operator" },
      { text: "Bigonial Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
  },

  thirds: {
    lines: [
      { from: "hairline", to: "glabella", color: "#c9a96e" },
      { from: "glabella", to: "subnasale", color: "#a78bfa" },
      { from: "subnasale", to: "chin", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Facial Thirds", role: "label" },
    ],
  },

  fifths: {
    lines: [
      { from: "ear_l", to: "l_eye_lat", color: "#c9a96e" },
      { from: "l_eye_lat", to: "l_eye_med", color: "#a78bfa" },
      { from: "l_eye_med", to: "r_eye_med", color: "#60a5fa" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#a78bfa" },
      { from: "r_eye_lat", to: "ear_r", color: "#c9a96e" },
    ],
    angles: [],
    formulaParts: [
      { text: "Facial Fifths", role: "label" },
    ],
  },

  fwhr: {
    lines: [
      { from: "zygo_l", to: "zygo_r", color: "#c9a96e" },
      { from: "glabella", to: "upper_lip_top", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "FWHR", role: "label" },
      { text: "=", role: "operator" },
      { text: "Bizygomatic Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Mid-face Height", role: "denominator" },
    ],
  },

  tfwhr: {
    lines: [
      { from: "hairline", to: "chin", color: "#c9a96e" },
      { from: "zygo_l", to: "zygo_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "TFWHR", role: "label" },
      { text: "=", role: "operator" },
      { text: "Total Face Height", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
  },

  iaaJfa: {
    lines: [
      { from: "subnasale", to: "l_eye_lat", color: "#c9a96e" },
      { from: "subnasale", to: "r_eye_lat", color: "#c9a96e" },
      { from: "jaw_l", to: "jaw_apex", color: "#60a5fa" },
      { from: "jaw_r", to: "jaw_apex", color: "#60a5fa" },
    ],
    angles: [
      { p1: "l_eye_lat", p2: "subnasale", p3: "r_eye_lat", color: "#c9a96e" },
      { p1: "jaw_l", p2: "jaw_apex", p3: "jaw_r", color: "#60a5fa" },
    ],
    formulaParts: [
      { text: "IAA", role: "numerator" },
      { text: "-", role: "operator" },
      { text: "JFA", role: "denominator" },
    ],
  },

  midface: {
    lines: [
      { from: "l_pupil", to: "r_pupil", color: "#c9a96e" },
      { from: "glabella", to: "upper_lip_top", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Midface Ratio", role: "label" },
      { text: "=", role: "operator" },
      { text: "Interpupillary Distance", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Mid-face Height", role: "denominator" },
    ],
  },

  noseHW: {
    lines: [
      { from: "nasion", to: "subnasale", color: "#c9a96e" },
      { from: "nose_w_l", to: "nose_w_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Nose H:W", role: "label" },
      { text: "=", role: "operator" },
      { text: "Nose Height", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
  },

  noseBizygo: {
    lines: [
      { from: "zygo_l", to: "zygo_r", color: "#c9a96e" },
      { from: "nose_w_l", to: "nose_w_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Nose:Bizygo", role: "label" },
      { text: "=", role: "operator" },
      { text: "Bizygomatic Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
  },

  lipRatio: {
    lines: [
      { from: "lip_center", to: "lower_lip_bot", color: "#c9a96e" },
      { from: "upper_lip_top", to: "lip_center", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Lip Ratio", role: "label" },
      { text: "=", role: "operator" },
      { text: "Lower Lip Height", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Upper Lip Height", role: "denominator" },
    ],
  },

  chinPhil: {
    lines: [
      { from: "lower_lip_bot", to: "chin", color: "#c9a96e" },
      { from: "subnasale", to: "upper_lip_top", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Chin:Philtrum", role: "label" },
      { text: "=", role: "operator" },
      { text: "Chin Height", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Philtrum Height", role: "denominator" },
    ],
  },

  mouthBigon: {
    lines: [
      { from: "mouth_l", to: "mouth_r", color: "#c9a96e" },
      { from: "gonia_l", to: "gonia_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Mouth:Bigonial", role: "label" },
      { text: "=", role: "operator" },
      { text: "Mouth Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bigonial Width", role: "denominator" },
    ],
  },

  mouthNose: {
    lines: [
      { from: "mouth_l", to: "mouth_r", color: "#c9a96e" },
      { from: "nose_w_l", to: "nose_w_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Mouth:Nose", role: "label" },
      { text: "=", role: "operator" },
      { text: "Mouth Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
  },

  bitemporal: {
    lines: [
      { from: "temporal_l", to: "temporal_r", color: "#c9a96e" },
      { from: "zygo_l", to: "zygo_r", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Bitemporal", role: "label" },
      { text: "=", role: "operator" },
      { text: "Bitemporal Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
  },

  forehead: {
    lines: [
      { from: "temporal_l", to: "temporal_r", color: "#c9a96e" },
      { from: "hairline", to: "glabella", color: "#60a5fa" },
    ],
    angles: [],
    formulaParts: [
      { text: "Forehead L:W", role: "label" },
      { text: "=", role: "operator" },
      { text: "Forehead Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Forehead Height", role: "denominator" },
    ],
  },
};