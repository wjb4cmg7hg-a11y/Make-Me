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
    numerator: "#ffab00",
    denominator: "#00c3ff",
    operator: "#ffffff",
    angle: "#ee82ee",
    label: "#ffffff",
};


// prettier-ignore
export const DIAGRAMS: Record<string, MeasurementDiagram> = {
  esr: {
    lines: [
      { from: "l_pupil", to: "r_pupil", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
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
      { from: "l_eye_med", to: "l_eye_lat", color: "#ee82ee" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#ee82ee" },
    ],
    angles: [],
    formulaParts: [
      { text: "Canthal Tilt", role: "label" },
    ],
  },

  pfl: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#ffab00" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
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
      { from: "subnasale", to: "l_eye_lat", color: "#ee82ee" },
      { from: "subnasale", to: "r_eye_lat", color: "#ee82ee" },
    ],
    angles: [{ p1: "l_eye_lat", p2: "subnasale", p3: "r_eye_lat", color: "#ee82ee" }],
    formulaParts: [
      { text: "IAA", role: "label" },
      { text: "=", role: "operator" },
      { text: "Infraorbital Alar Angle", role: "angle" },
    ],
  },

  icd: {
    lines: [
      { from: "l_eye_med", to: "l_eye_lat", color: "#ffab00" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#ffab00" },
      { from: "l_eye_med", to: "r_eye_med", color: "#00c3ff" },
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
      { from: "l_eye_med", to: "l_eye_lat", color: "#ffab00" },
      { from: "l_eye_top", to: "l_eye_bot", color: "#00c3ff" },
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
      { from: "lip_center", to: "l_pupil", color: "#ee82ee" },
      { from: "lip_center", to: "r_pupil", color: "#ee82ee" },
    ],
    angles: [{ p1: "l_pupil", p2: "lip_center", p3: "r_pupil", color: "#ee82ee" }],
    formulaParts: [
      { text: "EME", role: "label" },
      { text: "=", role: "operator" },
      { text: "Eye-Mouth-Eye Angle", role: "angle" },
    ],
  },

  jfa: {
    lines: [
      { from: "jaw_l", to: "jaw_apex", color: "#ee82ee" },
      { from: "jaw_r", to: "jaw_apex", color: "#ee82ee" },
    ],
    angles: [{ p1: "jaw_l", p2: "jaw_apex", p3: "jaw_r", color: "#ee82ee" }],
    formulaParts: [
      { text: "JFA", role: "label" },
      { text: "=", role: "operator" },
      { text: "Jaw Frontal Angle", role: "angle" },
    ],
  },

  lff: {
    lines: [
      { from: "nasion", to: "chin", color: "#ffab00" },
      { from: "hairline", to: "chin", color: "#00c3ff" },
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
      { from: "gonia_l", to: "gonia_r", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
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
      { from: "hairline", to: "glabella", color: "#ffab00" },
      { from: "glabella", to: "subnasale", color: "#ee82ee" },
      { from: "subnasale", to: "chin", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Facial Thirds", role: "label" },
    ],
  },

  fifths: {
    lines: [
      { from: "ear_l", to: "l_eye_lat", color: "#ffab00" },
      { from: "l_eye_lat", to: "l_eye_med", color: "#ee82ee" },
      { from: "l_eye_med", to: "r_eye_med", color: "#00c3ff" },
      { from: "r_eye_med", to: "r_eye_lat", color: "#ee82ee" },
      { from: "r_eye_lat", to: "ear_r", color: "#ffab00" },
    ],
    angles: [],
    formulaParts: [
      { text: "Facial Fifths", role: "label" },
    ],
  },

  fwhr: {
    lines: [
      { from: "zygo_l", to: "zygo_r", color: "#ffab00" },
      { from: "mid_eyebrow", to: "upper_lip_top", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "FWHR", role: "label" },
      { text: "=", role: "operator" },
      { text: "Bizygomatic Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Mid-Eyebrow to Lip Height", role: "denominator" },
    ],
  },

  tfwhr: {
    lines: [
      { from: "hairline", to: "chin", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
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
      { from: "subnasale", to: "l_eye_lat", color: "#ffab00" },
      { from: "subnasale", to: "r_eye_lat", color: "#ffab00" },
      { from: "jaw_l", to: "jaw_apex", color: "#00c3ff" },
      { from: "jaw_r", to: "jaw_apex", color: "#00c3ff" },
    ],
    angles: [
      { p1: "l_eye_lat", p2: "subnasale", p3: "r_eye_lat", color: "#ffab00" },
      { p1: "jaw_l", p2: "jaw_apex", p3: "jaw_r", color: "#00c3ff" },
    ],
    formulaParts: [
      { text: "IAA", role: "numerator" },
      { text: "-", role: "operator" },
      { text: "JFA", role: "denominator" },
    ],
  },

  midface: {
    lines: [
      { from: "l_pupil", to: "r_pupil", color: "#ffab00" },
      { from: "mid_pupil", to: "upper_lip_top", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Midface Ratio", role: "label" },
      { text: "=", role: "operator" },
      { text: "Interpupillary Distance", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Mid-Pupil to Lip Height", role: "denominator" },
    ],
  },

  noseHW: {
    lines: [
      { from: "nasion", to: "subnasale", color: "#ffab00" },
      { from: "nose_w_l", to: "nose_w_r", color: "#00c3ff" },
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
      { from: "zygo_l", to: "zygo_r", color: "#ffab00" },
      { from: "nose_w_l", to: "nose_w_r", color: "#00c3ff" },
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
      { from: "lip_center", to: "lower_lip_bot", color: "#ffab00" },
      { from: "upper_lip_top", to: "lip_center", color: "#00c3ff" },
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
      { from: "lower_lip_bot", to: "chin", color: "#ffab00" },
      { from: "subnasale", to: "upper_lip_top", color: "#00c3ff" },
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
      { from: "mouth_l", to: "mouth_r", color: "#ffab00" },
      { from: "gonia_l", to: "gonia_r", color: "#00c3ff" },
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
      { from: "mouth_l", to: "mouth_r", color: "#ffab00" },
      { from: "nose_w_l", to: "nose_w_r", color: "#00c3ff" },
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
      { from: "temporal_l", to: "temporal_r", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
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
      { from: "temporal_l", to: "temporal_r", color: "#ffab00" },
      { from: "hairline", to: "glabella", color: "#00c3ff" },
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

  lowerThird: {
    lines: [
      { from: "subnasale", to: "chin", color: "#ffab00" },
      { from: "hairline", to: "chin", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Lower Third", role: "label" },
      { text: "=", role: "operator" },
      { text: "Subnasale to Chin", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Hairline to Chin", role: "denominator" },
    ],
  },

  topThird: {
    lines: [
      { from: "hairline", to: "glabella", color: "#ffab00" },
      { from: "hairline", to: "chin", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Top Third", role: "label" },
      { text: "=", role: "operator" },
      { text: "Hairline to Glabella", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Hairline to Chin", role: "denominator" },
    ],
  },

  middleThird: {
    lines: [
      { from: "glabella", to: "subnasale", color: "#ffab00" },
      { from: "hairline", to: "chin", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Middle Third", role: "label" },
      { text: "=", role: "operator" },
      { text: "Glabella to Subnasale", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Hairline to Chin", role: "denominator" },
    ],
  },

  cheekboneHeight: {
    lines: [
      { from: "l_pupil", to: "zygo_l", color: "#ffab00", dashed: true },
      { from: "l_eye_top", to: "nasion", color: "#00c3ff", dashed: true },
    ],
    angles: [],
    formulaParts: [
      { text: "Cheekbone Height", role: "label" },
    ],
  },

  eyebrowLowsetness: {
    lines: [
      { from: "l_eyebrow_bot", to: "l_pupil", color: "#ffab00" },
      { from: "l_eye_lat", to: "l_eye_med", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Eyebrow Lowsetness", role: "label" },
      { text: "=", role: "operator" },
      { text: "Eyebrow to Pupil", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Eye Width", role: "denominator" },
    ],
  },

  browLengthToFaceWidth: {
    lines: [
      { from: "l_eyebrow_l", to: "r_eyebrow_r", color: "#ffab00" },
      { from: "zygo_l", to: "zygo_r", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Brow Length to Face Width", role: "label" },
      { text: "=", role: "operator" },
      { text: "Brow Length", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Face Width", role: "denominator" },
    ],
  },

  eyebrowTilt: {
    lines: [
      { from: "l_eyebrow_r", to: "l_eyebrow_l", color: "#ee82ee" },
    ],
    angles: [],
    formulaParts: [
      { text: "Eyebrow Tilt", role: "label" },
    ],
  },

  noseWidthToNoseBridgeWidth: {
    lines: [
      { from: "nose_w_l", to: "nose_w_r", color: "#ffab00" },
      { from: "nose_bridge_l", to: "nose_bridge_r", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Nose Width to Nose Bridge Width", role: "label" },
      { text: "=", role: "operator" },
      { text: "Nose Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Nose Bridge Width", role: "denominator" },
    ],
  },

  intercanthalToNoseWidth: {
    lines: [
      { from: "l_eye_med", to: "r_eye_med", color: "#ffab00" },
      { from: "nose_w_l", to: "nose_w_r", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Intercanthal to Nose Width", role: "label" },
      { text: "=", role: "operator" },
      { text: "Intercanthal Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
  },

  icdToMouthWidthRatio: {
    lines: [
      { from: "l_eye_med", to: "r_eye_med", color: "#ffab00" },
      { from: "mouth_l", to: "mouth_r", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "ICD to Mouth Width Ratio", role: "label" },
      { text: "=", role: "operator" },
      { text: "Intercanthal Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Mouth Width", role: "denominator" },
    ],
  },

  lowerThirdProportion: {
    lines: [
      { from: "subnasale", to: "upper_lip_top", color: "#ffab00" },
      { from: "subnasale", to: "chin", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Lower Third Proportion", role: "label" },
      { text: "=", role: "operator" },
      { text: "Subnasale to Upper Lip", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Subnasale to Chin", role: "denominator" },
    ],
  },

  neckWidth: {
    lines: [
      { from: "neck_l", to: "neck_r", color: "#ffab00" },
      { from: "gonia_l", to: "gonia_r", color: "#00c3ff" },
    ],
    angles: [],
    formulaParts: [
      { text: "Neck Width", role: "label" },
      { text: "=", role: "operator" },
      { text: "Neck Width", role: "numerator" },
      { text: "/", role: "operator" },
      { text: "Bigonial Width", role: "denominator" },
    ],
  },
};