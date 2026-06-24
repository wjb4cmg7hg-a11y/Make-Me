
import type { PointKey } from './keyPoints';

export interface LineDef {
  from: PointKey;
  to: PointKey;
  role: 'numerator' | 'denominator' | 'ref';
  label?: string;
}

export interface AngleDef {
  vertex: PointKey;
  arm1: PointKey;
  arm2: PointKey;
  label: string;
}

export interface FormulaPart {
  text: string;
  role: 'numerator' | 'denominator' | 'operator' | 'suffix' | 'angle' | 'ref';
}

export interface RatioDiagram {
  formulaParts: FormulaPart[];
  lines: LineDef[];
  angles: AngleDef[];
}

export const ROLE_COLOR = {
  numerator: "#c9a96e",
  denominator: "#60a5fa",
  ref: "#a78bfa",
  angle: "#a78bfa",
};

export const DIAGRAMS: Record<string, RatioDiagram> = {
  esr: {
    formulaParts: [
      { text: "Pupil Separation", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
      { text: " × 100", role: "suffix" },
    ],
    lines: [
      { from: "r_pupil",  to: "l_pupil", role: "numerator"},
      { from: "zygo_r",   to: "zygo_l",  role: "denominator" },
    ],
    angles: [],
  },
  canthal: {
    formulaParts: [
      { text: "Angle of Canthus Line vs Horizontal", role: "angle" },
    ],
    lines: [
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator" },
      { from: "l_eye_med", to: "l_eye_lat", role: "denominator" },
    ],
    angles: [],
  },
  pfl: {
    formulaParts: [
      { text: "Eye Fissure Length", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
      { text: " × 100", role: "suffix" },
    ],
    lines: [
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator" },
      { from: "l_eye_med", to: "l_eye_lat", role: "numerator" },
      { from: "zygo_r",    to: "zygo_l",    role: "denominator" },
    ],
    angles: [],
  },
  iaa: {
    formulaParts: [
      { text: "Angle at Alar Base to Lateral Canthi", role: "angle" },
    ],
    lines: [
      { from: "subnasale",  to: "r_eye_lat", role: "numerator" },
      { from: "subnasale",  to: "l_eye_lat", role: "denominator" },
    ],
    angles: [
      { vertex: "subnasale", arm1: "r_eye_lat", arm2: "l_eye_lat", label: "IAA" },
    ],
  },
  icd: {
    formulaParts: [
      { text: "Eye Fissure Length", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Intercanthal Distance", role: "denominator" },
    ],
    lines: [
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator" },
      { from: "l_eye_med", to: "l_eye_lat", role: "numerator" },
      { from: "r_eye_med", to: "l_eye_med", role: "denominator" },
    ],
    angles: [],
  },
  ear: {
    formulaParts: [
      { text: "Eye Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Eye Height", role: "denominator" },
    ],
    lines: [
      { from: "r_eye_lat", to: "r_eye_med", role: "numerator" },
      { from: "l_eye_lat", to: "l_eye_med", role: "numerator" },
      { from: "r_eye_top", to: "r_eye_bot", role: "denominator" },
      { from: "l_eye_top", to: "l_eye_bot", role: "denominator" },
    ],
    angles: [],
  },
  eme: {
    formulaParts: [
      { text: "Angle at Mouth Center to Pupils", role: "angle" },
    ],
    lines: [
      { from: "lip_center", to: "l_pupil", role: "numerator" },
      { from: "lip_center", to: "r_pupil", role: "denominator" },
    ],
    angles: [
      { vertex: "lip_center", arm1: "l_pupil", arm2: "r_pupil", label: "EME" },
    ],
  },
  jfa: {
    formulaParts: [
      { text: "Angle at Jaw Apex Between Mandible Lines", role: "angle" },
    ],
    lines: [
      { from: "gonia_r",  to: "jaw_apex", role: "numerator" },
      { from: "gonia_l",  to: "jaw_apex", role: "denominator" },
    ],
    angles: [
      { vertex: "jaw_apex", arm1: "gonia_r", arm2: "gonia_l", label: "JFA" },
    ],
  },
  lff: {
    formulaParts: [
      { text: "Nasion → Chin", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Hairline → Chin", role: "denominator" },
      { text: " × 100", role: "suffix" },
    ],
    lines: [
      { from: "nasion",   to: "chin", role: "numerator" },
      { from: "hairline", to: "chin", role: "denominator" },
    ],
    angles: [],
  },
  jaww: {
    formulaParts: [
      { text: "Bigonial Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
    lines: [
      { from: "gonia_r", to: "gonia_l", role: "numerator" },
      { from: "zygo_r",  to: "zygo_l",  role: "denominator" },
    ],
    angles: [],
  },
  thirds: {
    formulaParts: [
      { text: "Hairline→Glabella : Glabella→Subnasale : Subnasale→Chin", role: "angle" },
    ],
    lines: [
      { from: "hairline",  to: "glabella",  role: "numerator" },
      { from: "glabella",  to: "subnasale", role: "denominator" },
      { from: "subnasale", to: "chin",      role: "ref" },
    ],
    angles: [],
  },
  fwhr: {
    formulaParts: [
      { text: "Bizygomatic Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Mid Eyebrow → Upper Lip", role: "denominator" },
    ],
    lines: [
      { from: "zygo_r",   to: "zygo_l",  role: "numerator" },
      { from: "mid_eyebrow", to: "upper_lip_top", role: "denominator" },
    ],
    angles: [],
  },
  tfwhr: {
    formulaParts: [
      { text: "Total Face Height", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
    ],
    lines: [
      { from: "hairline", to: "chin",    role: "numerator" },
      { from: "zygo_r",   to: "zygo_l",  role: "denominator" },
    ],
    angles: [],
  },
  iaaJfa: {
    formulaParts: [
      { text: "IAA Angle", role: "numerator" },
      { text: " − ", role: "operator" },
      { text: "JFA Angle", role: "denominator" },
    ],
    lines: [
      { from: "subnasale", to: "r_eye_lat", role: "numerator" },
      { from: "subnasale", to: "l_eye_lat", role: "numerator" },
      { from: "gonia_r",   to: "jaw_apex",  role: "denominator" },
      { from: "gonia_l",   to: "jaw_apex",  role: "denominator" },
    ],
    angles: [
      { vertex: "subnasale", arm1: "r_eye_lat", arm2: "l_eye_lat", label: "IAA" },
      { vertex: "jaw_apex",  arm1: "gonia_r",   arm2: "gonia_l",   label: "JFA" },
    ],
  },
  midface: {
    formulaParts: [
      { text: "Interpupil Distance", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Midface Height", role: "denominator" },
    ],
    lines: [
        { from: "r_pupil", to: "l_pupil", role: "numerator" },
        { from: "mid_pupil", to: "upper_lip_top", role: "denominator" }
    ],
    angles: [],
  },
  noseHW: {
    formulaParts: [
      { text: "Nose Height", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
    lines: [
      { from: "glabella",  to: "subnasale", role: "numerator" },
      { from: "nose_w_r",  to: "nose_w_l",  role: "denominator" },
    ],
    angles: [],
  },
  noseBizygo: {
    formulaParts: [
      { text: "Bizygomatic Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
    lines: [
      { from: "zygo_r",   to: "zygo_l",  role: "numerator" },
      { from: "nose_w_r", to: "nose_w_l", role: "denominator" },
    ],
    angles: [],
  },
  lipRatio: {
    formulaParts: [
      { text: "Lower Lip Height", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Upper Lip Height", role: "denominator" },
    ],
    lines: [
      { from: "lip_center",  to: "lower_lip_bot", role: "numerator" },
      { from: "upper_lip_top", to: "lip_center",  role: "denominator" },
    ],
    angles: [],
  },
  chinPhil: {
    formulaParts: [
      { text: "Chin → Lower Lip", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Subnasale → Upper Lip", role: "denominator" },
    ],
    lines: [
      { from: "lower_lip_bot", to: "chin",          role: "numerator" },
      { from: "subnasale",     to: "upper_lip_top",  role: "denominator" },
    ],
    angles: [],
  },
  mouthBigon: {
    formulaParts: [
      { text: "Mouth Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bigonial Width", role: "denominator" },
      { text: " × 100", role: "suffix" },
    ],
    lines: [
      { from: "mouth_r",  to: "mouth_l",  role: "numerator" },
      { from: "gonia_r",  to: "gonia_l",  role: "denominator" },
    ],
    angles: [],
  },
  mouthNose: {
    formulaParts: [
      { text: "Mouth Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Nose Width", role: "denominator" },
    ],
    lines: [
      { from: "mouth_r",  to: "mouth_l",  role: "numerator" },
      { from: "nose_w_r", to: "nose_w_l", role: "denominator" },
    ],
    angles: [],
  },
  bitemporal: {
    formulaParts: [
      { text: "Temporal Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Bizygomatic Width", role: "denominator" },
      { text: " × 100", role: "suffix" },
    ],
    lines: [
      { from: "temporal_r", to: "temporal_l", role: "numerator" },
      { from: "zygo_r",     to: "zygo_l",     role: "denominator" },
    ],
    angles: [],
  },
  forehead: {
    formulaParts: [
      { text: "Temporal Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Hairline → Glabella", role: "denominator" },
    ],
    lines: [
      { from: "temporal_r", to: "temporal_l", role: "numerator" },
      { from: "hairline",   to: "glabella",   role: "denominator" },
    ],
    angles: [],
  },
};
