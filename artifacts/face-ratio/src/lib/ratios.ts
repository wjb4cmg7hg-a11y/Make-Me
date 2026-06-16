import type { KeyPointPositions } from "./keyPoints";
import {
  dist,
  midpoint,
  canthalTilt,
  verticalDist,
  angleBetweenVectors,
} from "./geometry";

export interface RatioIdeal {
  min: number;
  max: number;
}

export interface RatioResult {
  key: string;
  name: string;
  abbr: string;
  value: number | null;
  ideal: RatioIdeal;
  unit: string;
  score: "ideal" | "close" | "off" | "unknown";
  deviation: number | null;
  description: string;
}

function scoreResult(value: number, ideal: RatioIdeal): RatioResult["score"] {
  if (value >= ideal.min && value <= ideal.max) return "ideal";
  const range = ideal.max - ideal.min;
  const dev =
    value < ideal.min
      ? (ideal.min - value) / range
      : (value - ideal.max) / range;
  return dev <= 0.15 ? "close" : "off";
}

function deviationPct(value: number, ideal: RatioIdeal): number {
  if (value >= ideal.min && value <= ideal.max) return 0;
  const range = ideal.max - ideal.min;
  return value < ideal.min
    ? ((ideal.min - value) / range) * 100
    : ((value - ideal.max) / range) * 100;
}

export function computeRatios(kp: KeyPointPositions): RatioResult[] {
  const {
    hairline, glabella, nasion,
    temporal_r, temporal_l,
    ear_r, ear_l,
    zygo_r, zygo_l,
    gonia_r, gonia_l,
    chin,
    r_eye_lat, r_eye_med, l_eye_lat, l_eye_med,
    r_eye_top, r_eye_bot, l_eye_top, l_eye_bot,
    r_pupil, l_pupil,
    alar_r, alar_l,
    nose_w_r, nose_w_l,
    subnasale,
    upper_lip_top, upper_lip_in,
    lower_lip_in, lower_lip_bot,
    mouth_r, mouth_l,
  } = kp;

  const alarMid       = midpoint(alar_r, alar_l);
  const pupilMid      = midpoint(r_pupil, l_pupil);
  const mouthMid      = midpoint(mouth_r, mouth_l);

  const bizygoWidth   = dist(zygo_r, zygo_l);
  const rEyeWidth     = dist(r_eye_lat, r_eye_med);
  const lEyeWidth     = dist(l_eye_lat, l_eye_med);
  const eyeWidth      = (rEyeWidth + lEyeWidth) / 2;
  const interpupilDist  = dist(r_pupil, l_pupil);
  const intercanthalDist = dist(r_eye_med, l_eye_med);
  const noseWidth     = dist(nose_w_r, nose_w_l);
  const mouthWidth    = dist(mouth_r, mouth_l);
  const bigonialWidth = dist(gonia_r, gonia_l);
  const temporalWidth = dist(temporal_r, temporal_l);

  const totalFaceHeight    = verticalDist(hairline, chin);
  const glabellaToUpperLip = verticalDist(glabella, upper_lip_top);
  const hairlineToGlabella = verticalDist(hairline, glabella);
  // Nose height: glabella down to subnasale
  const noseHeight         = verticalDist(glabella, subnasale);
  const nasionToChin       = verticalDist(nasion, chin);
  // Philtrum: subnasale down to top of upper lip
  const philtrumHeight     = verticalDist(subnasale, upper_lip_top);

  // 1. ESR
  const esrVal   = (interpupilDist / bizygoWidth) * 100;
  const esrIdeal = { min: 44.5, max: 47.75 };

  // 2. Canthal Tilt
  const rTilt     = canthalTilt(r_eye_med, r_eye_lat);
  const lTilt     = canthalTilt(l_eye_med, l_eye_lat);
  const canthalVal   = (rTilt + lTilt) / 2;
  const canthalIdeal = { min: 5, max: 8.5 };

  // 3. PFL to bizygo
  const pflVal   = (eyeWidth / bizygoWidth) * 100;
  const pflIdeal = { min: 19.5, max: 21.5 };

  // 4. IAA — angle at subnasale between lines to lateral canthi
  const iaaV1x = r_eye_lat.x - subnasale.x;
  const iaaV1y = r_eye_lat.y - subnasale.y;
  const iaaV2x = l_eye_lat.x - subnasale.x;
  const iaaV2y = l_eye_lat.y - subnasale.y;
  const iaaVal   = angleBetweenVectors(iaaV1x, iaaV1y, iaaV2x, iaaV2y);
  const iaaIdeal = { min: 85, max: 95 };

  // 5. ICD
  const icdVal   = eyeWidth / intercanthalDist;
  const icdIdeal = { min: 0.93, max: 1.05 };

  // 6. Eye Aspect Ratio
  const rEyeH  = dist(r_eye_top, r_eye_bot);
  const lEyeH  = dist(l_eye_top, l_eye_bot);
  const eyeH   = (rEyeH + lEyeH) / 2;
  const earVal   = eyeWidth / eyeH;
  const earIdeal = { min: 3, max: 3.6 };

  // 7. EME
  const halfIPD   = interpupilDist / 2;
  const vertMouth = verticalDist(pupilMid, mouthMid);
  const emeVal    = Math.atan2(vertMouth, halfIPD) * (180 / Math.PI);
  const emeIdeal  = { min: 45, max: 49 };

  // 8. JFA
  const jfaV1x = gonia_r.x - chin.x;
  const jfaV1y = gonia_r.y - chin.y;
  const jfaV2x = gonia_l.x - chin.x;
  const jfaV2y = gonia_l.y - chin.y;
  const jfaVal   = angleBetweenVectors(jfaV1x, jfaV1y, jfaV2x, jfaV2y);
  const jfaIdeal = { min: 85, max: 95 };

  // 9. Lower Full Face
  const lffVal   = (nasionToChin / totalFaceHeight) * 100;
  const lffIdeal = { min: 67, max: 71 };

  // 10. Jaw Width
  const jawWidthVal   = bigonialWidth / bizygoWidth;
  const jawWidthIdeal = { min: 0.86, max: 0.92 };

  // 11. Facial Thirds — use subnasale as divider between mid and lower
  const upperThird = (hairlineToGlabella / totalFaceHeight) * 100;
  const midThird   = (verticalDist(glabella, subnasale) / totalFaceHeight) * 100;
  const lowerThird = (verticalDist(subnasale, chin) / totalFaceHeight) * 100;
  const thirdsVal  = (Math.abs(upperThird - 33) + Math.abs(midThird - 31) + Math.abs(lowerThird - 36)) / 3;
  const thirdsIdeal = { min: 0, max: 2 };

  // 12. Facial Fifths
  const earToLatR  = dist(ear_r, r_eye_lat);
  const earToLatL  = dist(ear_l, l_eye_lat);
  const totalWidth = earToLatR + rEyeWidth + intercanthalDist + lEyeWidth + earToLatL;
  const fifth      = totalWidth / 5;
  const fifthsVal  = (
    Math.abs(earToLatR - fifth) +
    Math.abs(rEyeWidth - fifth) +
    Math.abs(intercanthalDist - fifth) +
    Math.abs(lEyeWidth - fifth) +
    Math.abs(earToLatL - fifth)
  ) / fifth * 100 / 5;
  const fifthsIdeal = { min: 0, max: 5 };

  // 13. FWHR
  const fwhrVal   = bizygoWidth / glabellaToUpperLip;
  const fwhrIdeal = { min: 1.9, max: 2.05 };

  // 14. TFWHR
  const tfwhrVal   = totalFaceHeight / bizygoWidth;
  const tfwhrIdeal = { min: 1.33, max: 1.38 };

  // 15. IAA:JFA
  const iaaJfaVal   = Math.abs(iaaVal - jfaVal);
  const iaaJfaIdeal = { min: 0, max: 3 };

  // 16. Midface Ratio
  const midfaceVal   = interpupilDist / glabellaToUpperLip;
  const midfaceIdeal = { min: 0.96, max: 1.02 };

  // 17. Nose H:W — use subnasale for nose height
  const noseHWVal   = noseHeight / noseWidth;
  const noseHWIdeal = { min: 1.44, max: 1.52 };

  // 18. Nose to Bizygo
  const noseBizygoVal   = bizygoWidth / noseWidth;
  const noseBizygoIdeal = { min: 3.85, max: 4.15 };

  // 19. Lower:Upper Lip
  const upperLipH     = verticalDist(upper_lip_top, upper_lip_in);
  const lowerLipH     = verticalDist(lower_lip_in, lower_lip_bot);
  const lipRatioVal   = lowerLipH / upperLipH;
  const lipRatioIdeal = { min: 1.4, max: 2 };

  // 20. Chin to Philtrum — use subnasale for philtrum height
  const chinToLowerLip     = verticalDist(lower_lip_bot, chin);
  const chinToPhiltrumVal  = chinToLowerLip / philtrumHeight;
  const chinToPhiltrumIdeal = { min: 2.1, max: 2.75 };

  // 21. Mouth to Bigonial
  const mouthBigonialVal   = (mouthWidth / bigonialWidth) * 100;
  const mouthBigonialIdeal = { min: 40, max: 48 };

  // 22. Mouth to Nose
  const mouthNoseVal   = mouthWidth / noseWidth;
  const mouthNoseIdeal = { min: 1.45, max: 1.83 };

  // 23. Bitemporal
  const bitemporalVal   = (temporalWidth / bizygoWidth) * 100;
  const bitemporalIdeal = { min: 85, max: 95 };

  // 24. Forehead Length
  const foreheadLengthVal   = temporalWidth / hairlineToGlabella;
  const foreheadLengthIdeal = { min: 0.45, max: 0.52 };

  const raw: Array<{
    key: string; name: string; abbr: string; value: number;
    ideal: RatioIdeal; unit: string; description: string;
  }> = [
    { key: "esr",        name: "Eye Separation Ratio",     abbr: "ESR",     value: esrVal,            ideal: esrIdeal,            unit: "%",     description: "Pupil distance as % of bizygomatic width" },
    { key: "canthal",    name: "Canthal Tilt",              abbr: "CT",      value: canthalVal,         ideal: canthalIdeal,        unit: "°",     description: "Angle of canthus axis — outer corner above inner" },
    { key: "pfl",        name: "PFL to Bizygo",             abbr: "PFL",     value: pflVal,             ideal: pflIdeal,            unit: "%",     description: "Eye fissure length as % of bizygomatic width" },
    { key: "iaa",        name: "Infraorbital Alar Angle",   abbr: "IAA",     value: iaaVal,             ideal: iaaIdeal,            unit: "°",     description: "Angle at subnasale formed by lines to lateral canthi" },
    { key: "icd",        name: "Intercanthal Ratio",        abbr: "ICD",     value: icdVal,             ideal: icdIdeal,            unit: "×",     description: "Eye width divided by intercanthal distance" },
    { key: "ear",        name: "Eye Aspect Ratio",          abbr: "EAR",     value: earVal,             ideal: earIdeal,            unit: "×",     description: "Horizontal eye length divided by vertical height" },
    { key: "eme",        name: "Eye-Mouth-Eye Angle",       abbr: "EME",     value: emeVal,             ideal: emeIdeal,            unit: "°",     description: "Angle from pupil midpoint down to mouth center" },
    { key: "jfa",        name: "Jaw Frontal Angle",         abbr: "JFA",     value: jfaVal,             ideal: jfaIdeal,            unit: "°",     description: "Angle at chin between the two mandible lines" },
    { key: "lff",        name: "Lower Full Face Ratio",     abbr: "LFF",     value: lffVal,             ideal: lffIdeal,            unit: "%",     description: "Nasion-to-chin as % of total face height" },
    { key: "jaww",       name: "Jaw Width",                 abbr: "JW",      value: jawWidthVal,        ideal: jawWidthIdeal,       unit: "×",     description: "Bigonial width divided by bizygomatic width" },
    { key: "thirds",     name: "Facial Thirds",             abbr: "F3",      value: thirdsVal,          ideal: thirdsIdeal,         unit: "% dev", description: "Avg deviation from ideal thirds (33 / 31 / 36)" },
    { key: "fifths",     name: "Facial Fifths",             abbr: "F5",      value: fifthsVal,          ideal: fifthsIdeal,         unit: "% dev", description: "Avg deviation from equal facial fifths" },
    { key: "fwhr",       name: "Face Width-Height Ratio",   abbr: "FWHR",    value: fwhrVal,            ideal: fwhrIdeal,           unit: "×",     description: "Bizygomatic width ÷ glabella-to-upper-lip (midface height)" },
    { key: "tfwhr",      name: "Total Face W-H Ratio",      abbr: "TFWHR",   value: tfwhrVal,           ideal: tfwhrIdeal,          unit: "×",     description: "Total face height divided by bizygomatic width" },
    { key: "iaaJfa",     name: "IAA–JFA Difference",        abbr: "IAA:JFA", value: iaaJfaVal,          ideal: iaaJfaIdeal,         unit: "°",     description: "Absolute difference between IAA and JFA angles" },
    { key: "midface",    name: "Midface Ratio",             abbr: "MFR",     value: midfaceVal,         ideal: midfaceIdeal,        unit: "×",     description: "Interpupil distance ÷ midface height (glabella→upper lip)" },
    { key: "noseHW",     name: "Nose Height to Width",      abbr: "N H:W",   value: noseHWVal,          ideal: noseHWIdeal,         unit: "×",     description: "Nose height (glabella → subnasale) ÷ nose width" },
    { key: "noseBizygo", name: "Nose to Bizygo",            abbr: "N:BZ",    value: noseBizygoVal,      ideal: noseBizygoIdeal,     unit: "×",     description: "Bizygomatic width divided by nose width" },
    { key: "lipRatio",   name: "Lower-to-Upper Lip",        abbr: "L:U Lip", value: lipRatioVal,        ideal: lipRatioIdeal,       unit: "×",     description: "Lower lip height divided by upper lip height" },
    { key: "chinPhil",   name: "Chin to Philtrum",          abbr: "C:Ph",    value: chinToPhiltrumVal,  ideal: chinToPhiltrumIdeal, unit: "×",     description: "Chin-to-lower-lip height ÷ philtrum height (subnasale→upper lip)" },
    { key: "mouthBigon", name: "Mouth to Bigonial",         abbr: "M:BG",    value: mouthBigonialVal,   ideal: mouthBigonialIdeal,  unit: "%",     description: "Mouth width as % of bigonial (jaw) width" },
    { key: "mouthNose",  name: "Mouth to Nose",             abbr: "M:N",     value: mouthNoseVal,       ideal: mouthNoseIdeal,      unit: "×",     description: "Mouth width divided by nose width" },
    { key: "bitemporal", name: "Bitemporal Ratio",          abbr: "BT",      value: bitemporalVal,      ideal: bitemporalIdeal,     unit: "%",     description: "Temporal ridge width as % of bizygomatic width" },
    { key: "forehead",   name: "Forehead Length",           abbr: "FHL",     value: foreheadLengthVal,  ideal: foreheadLengthIdeal, unit: "×",     description: "Temporal width ÷ hairline-to-glabella height" },
  ];

  return raw.map((r) => ({
    ...r,
    score: scoreResult(r.value, r.ideal),
    deviation: deviationPct(r.value, r.ideal),
  }));
}
