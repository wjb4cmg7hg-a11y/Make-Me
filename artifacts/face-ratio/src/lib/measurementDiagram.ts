import type { PointKey } from "./keyPoints";

export type LineRole = "numerator" | "denominator" | "ref";

export interface DiagramLine {
  from: PointKey;
  to: PointKey;
  role: LineRole;
  label: string;
}

export interface DiagramAngle {
  vertex: PointKey;
  arm1: PointKey;
  arm2: PointKey;
  label: string;
}

export interface FormulaPart {
  text: string;
  role?: "numerator" | "denominator" | "angle" | "operator" | "suffix";
}

export interface RatioDiagram {
  formulaParts: FormulaPart[];
  lines: DiagramLine[];
  angles: DiagramAngle[];
}

export const ROLE_COLOR: Record<LineRole, string> = {
  numerator:   "#c9a96e",
  denominator: "#60a5fa",
  ref:         "rgba(255,255,255,0.25)",
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
      { from: "r_pupil",  to: "l_pupil", role: "numerator",   label: "Pupil Sep." },
      { from: "zygo_r",   to: "zygo_l",  role: "denominator", label: "Bizygomatic" },
    ],
    angles: [],
  },

  canthal: {
    formulaParts: [
      { text: "Angle of Canthus Line vs Horizontal", role: "angle" },
    ],
    lines: [
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator",   label: "R Canthus" },
      { from: "l_eye_med", to: "l_eye_lat", role: "denominator", label: "L Canthus" },
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
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator",   label: "R Fissure" },
      { from: "l_eye_med", to: "l_eye_lat", role: "numerator",   label: "L Fissure" },
      { from: "zygo_r",    to: "zygo_l",    role: "denominator", label: "Bizygomatic" },
    ],
    angles: [],
  },

  iaa: {
    formulaParts: [
      { text: "Angle at Alar Base to Lateral Canthi", role: "angle" },
    ],
    lines: [
      { from: "subnasale",  to: "r_eye_lat", role: "numerator",   label: "Alar→R Canthus" },
      { from: "subnasale",  to: "l_eye_lat", role: "denominator", label: "Alar→L Canthus" },
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
      { from: "r_eye_med", to: "r_eye_lat", role: "numerator",   label: "R Eye Width" },
      { from: "r_eye_med", to: "l_eye_med", role: "denominator", label: "Intercanthal" },
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
      { from: "r_eye_lat", to: "r_eye_med", role: "numerator",   label: "Eye Width" },
      { from: "r_eye_top", to: "r_eye_bot", role: "denominator", label: "Eye Height" },
    ],
    angles: [],
  },

  eme: {
    formulaParts: [
      { text: "Angle at Pupil Midpoint → Mouth Center", role: "angle" },
    ],
    lines: [
      { from: "r_pupil",   to: "l_pupil",   role: "ref",         label: "Pupil Line" },
      { from: "r_pupil",   to: "mouth_r",   role: "numerator",   label: "Pupil→Mouth R" },
      { from: "l_pupil",   to: "mouth_l",   role: "denominator", label: "Pupil→Mouth L" },
    ],
    angles: [],
  },

  jfa: {
    formulaParts: [
      { text: "Angle at Jaw Apex Between Mandible Lines", role: "angle" },
    ],
    lines: [
      { from: "gonia_r",  to: "jaw_apex", role: "numerator",   label: "R Mandible" },
      { from: "gonia_l",  to: "jaw_apex", role: "denominator", label: "L Mandible" },
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
      { from: "nasion",   to: "chin", role: "numerator",   label: "Nasion→Chin" },
      { from: "hairline", to: "chin", role: "denominator", label: "Full Face Height" },
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
      { from: "gonia_r", to: "gonia_l", role: "numerator",   label: "Bigonial" },
      { from: "zygo_r",  to: "zygo_l",  role: "denominator", label: "Bizygomatic" },
    ],
    angles: [],
  },

  thirds: {
    formulaParts: [
      { text: "Hairline→Glabella : Glabella→Subnasale : Subnasale→Chin", role: "angle" },
    ],
    lines: [
      { from: "hairline",  to: "glabella",  role: "numerator",   label: "Upper Third" },
      { from: "glabella",  to: "subnasale", role: "denominator", label: "Mid Third" },
      { from: "subnasale", to: "chin",      role: "ref",         label: "Lower Third" },
    ],
    angles: [],
  },

  fifths: {
    formulaParts: [
      { text: "Ear→Canthus : Eye Width : Intercanthal : Eye Width : Canthus→Ear", role: "angle" },
    ],
    lines: [
      { from: "ear_r",    to: "r_eye_lat", role: "numerator",   label: "1st Fifth" },
      { from: "r_eye_lat",to: "r_eye_med", role: "denominator", label: "2nd Fifth" },
      { from: "r_eye_med",to: "l_eye_med", role: "ref",         label: "3rd Fifth" },
      { from: "l_eye_med",to: "l_eye_lat", role: "numerator",   label: "4th Fifth" },
      { from: "l_eye_lat",to: "ear_l",     role: "denominator", label: "5th Fifth" },
    ],
    angles: [],
  },

  fwhr: {
    formulaParts: [
      { text: "Bizygomatic Width", role: "numerator" },
      { text: " ÷ ", role: "operator" },
      { text: "Midface Height", role: "denominator" },
    ],
    lines: [
      { from: "zygo_r",       to: "zygo_l",        role: "numerator",   label: "Bizygomatic" },
      { from: "glabella",     to: "upper_lip_top",  role: "denominator", label: "Midface Height" },
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
      { from: "hairline", to: "chin",    role: "numerator",   label: "Face Height" },
      { from: "zygo_r",   to: "zygo_l",  role: "denominator", label: "Bizygomatic" },
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
      { from: "subnasale", to: "r_eye_lat", role: "numerator",   label: "IAA arm" },
      { from: "subnasale", to: "l_eye_lat", role: "numerator",   label: "IAA arm" },
      { from: "gonia_r",   to: "jaw_apex",  role: "denominator", label: "JFA arm" },
      { from: "gonia_l",   to: "jaw_apex",  role: "denominator", label: "JFA arm" },
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
      { from: "r_pupil",     to: "l_pupil",       role: "numerator",   label: "Pupil Sep." },
      { from: "glabella",    to: "upper_lip_top",  role: "denominator", label: "Midface Ht." },
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
      { from: "glabella",  to: "subnasale", role: "numerator",   label: "Nose Height" },
      { from: "nose_w_r",  to: "nose_w_l",  role: "denominator", label: "Nose Width" },
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
      { from: "zygo_r",   to: "zygo_l",  role: "numerator",   label: "Bizygomatic" },
      { from: "nose_w_r", to: "nose_w_l", role: "denominator", label: "Nose Width" },
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
      { from: "lower_lip_in",  to: "lower_lip_bot", role: "numerator",   label: "Lower Lip Ht." },
      { from: "upper_lip_top", to: "upper_lip_in",  role: "denominator", label: "Upper Lip Ht." },
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
      { from: "lower_lip_bot", to: "chin",          role: "numerator",   label: "Chin Seg." },
      { from: "subnasale",     to: "upper_lip_top",  role: "denominator", label: "Philtrum Ht." },
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
      { from: "mouth_r",  to: "mouth_l",  role: "numerator",   label: "Mouth Width" },
      { from: "gonia_r",  to: "gonia_l",  role: "denominator", label: "Bigonial" },
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
      { from: "mouth_r",  to: "mouth_l",  role: "numerator",   label: "Mouth Width" },
      { from: "nose_w_r", to: "nose_w_l", role: "denominator", label: "Nose Width" },
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
      { from: "temporal_r", to: "temporal_l", role: "numerator",   label: "Temporal" },
      { from: "zygo_r",     to: "zygo_l",     role: "denominator", label: "Bizygomatic" },
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
      { from: "temporal_r", to: "temporal_l", role: "numerator",   label: "Temporal Width" },
      { from: "hairline",   to: "glabella",   role: "denominator", label: "Forehead Height" },
    ],
    angles: [],
  },
};
