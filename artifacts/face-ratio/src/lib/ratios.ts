import { LM, Landmarks, getPoint, avgPoints } from "./landmarks";
import {
  Point,
  dist,
  midpoint,
  canthalTilt,
  verticalDist,
  horizontalDist,
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
  unit: string; // "°" | "ratio" | "%"
  score: "ideal" | "close" | "off" | "unknown";
  deviation: number | null; // % deviation from nearest ideal boundary (0 = in range)
  description: string;
}

function score(value: number, ideal: RatioIdeal): RatioResult["score"] {
  if (value >= ideal.min && value <= ideal.max) return "ideal";
  const range = ideal.max - ideal.min;
  const deviation = value < ideal.min
    ? (ideal.min - value) / range
    : (value - ideal.max) / range;
  if (deviation <= 0.15) return "close";
  return "off";
}

function deviation(value: number, ideal: RatioIdeal): number {
  if (value >= ideal.min && value <= ideal.max) return 0;
  const range = ideal.max - ideal.min;
  if (value < ideal.min) return ((ideal.min - value) / range) * 100;
  return ((value - ideal.max) / range) * 100;
}

export function computeRatios(
  landmarks: Landmarks,
  w: number,
  h: number,
): RatioResult[] {
  const p = (idx: number): Point => getPoint(landmarks, idx, w, h);
  const avg = (indices: readonly number[]): Point => avgPoints(landmarks, indices, w, h);

  // Key points
  const rEyeLat = p(LM.R_EYE_LATERAL);
  const rEyeMed = p(LM.R_EYE_MEDIAL);
  const rEyeTop = p(LM.R_EYE_TOP);
  const rEyeBot = p(LM.R_EYE_BOT);

  const lEyeLat = p(LM.L_EYE_LATERAL);
  const lEyeMed = p(LM.L_EYE_MEDIAL);
  const lEyeTop = p(LM.L_EYE_TOP);
  const lEyeBot = p(LM.L_EYE_BOT);

  const rPupil = avg(LM.R_IRIS_RING);
  const lPupil = avg(LM.L_IRIS_RING);
  const pupilMid = midpoint(rPupil, lPupil);

  const nasion = p(LM.NASION);
  const glabella = p(LM.GLABELLA);
  const alarR = p(LM.ALAR_R);
  const alarL = p(LM.ALAR_L);
  const alarMid = midpoint(alarR, alarL);
  const noseWR = p(LM.NOSE_W_R);
  const noseWL = p(LM.NOSE_W_L);

  const upperLipTop = p(LM.UPPER_LIP_TOP);
  const upperLipIn = p(LM.UPPER_LIP_IN);
  const lowerLipIn = p(LM.LOWER_LIP_IN);
  const lowerLipBot = p(LM.LOWER_LIP_BOT);
  const mouthR = p(LM.MOUTH_R);
  const mouthL = p(LM.MOUTH_L);
  const mouthMid = midpoint(mouthR, mouthL);

  const chin = p(LM.CHIN);
  const zygoR = p(LM.ZYGO_R);
  const zygoL = p(LM.ZYGO_L);
  const goniaR = p(LM.GONIA_R);
  const goniaL = p(LM.GONIA_L);

  const hairline = p(LM.HAIRLINE);
  const temporalR = p(LM.TEMPORAL_R);
  const temporalL = p(LM.TEMPORAL_L);

  const earR = p(LM.EAR_R);
  const earL = p(LM.EAR_L);

  // Derived measurements
  const bizygoWidth = dist(zygoR, zygoL);
  const rEyeWidth = dist(rEyeLat, rEyeMed);
  const lEyeWidth = dist(lEyeLat, lEyeMed);
  const eyeWidth = (rEyeWidth + lEyeWidth) / 2;
  const interpupilDist = dist(rPupil, lPupil);
  const intercanthalDist = dist(rEyeMed, lEyeMed); // ICD
  const noseWidth = dist(noseWR, noseWL);
  const mouthWidth = dist(mouthR, mouthL);
  const bigonialWidth = dist(goniaR, goniaL);
  const temporalWidth = dist(temporalR, temporalL);
  const totalFaceHeight = verticalDist(hairline, chin);
  const glabellaToUpperLip = verticalDist(glabella, upperLipTop);
  const hairlineToGlabella = verticalDist(hairline, glabella);
  const noseHeight = verticalDist(glabella, alarMid);
  const nasionToChin = verticalDist(nasion, chin);

  // Individual results

  // 1. ESR — Eye Separation Ratio
  const esrVal = (interpupilDist / bizygoWidth) * 100;
  const esrIdeal: RatioIdeal = { min: 44.5, max: 47.75 };

  // 2. Canthal Tilt
  const rTilt = canthalTilt(rEyeMed, rEyeLat);
  const lTilt = canthalTilt(lEyeMed, lEyeLat);
  const canthalVal = (rTilt + lTilt) / 2;
  const canthalIdeal: RatioIdeal = { min: 5, max: 8.5 };

  // 3. PFL to Bizygo
  const pflVal = (eyeWidth / bizygoWidth) * 100;
  const pflIdeal: RatioIdeal = { min: 19.5, max: 21.5 };

  // 4. IAA — Angle between lateral canthi and alar base midpoint
  const iaaV1x = rEyeLat.x - alarMid.x;
  const iaaV1y = rEyeLat.y - alarMid.y;
  const iaaV2x = lEyeLat.x - alarMid.x;
  const iaaV2y = lEyeLat.y - alarMid.y;
  const iaaVal = angleBetweenVectors(iaaV1x, iaaV1y, iaaV2x, iaaV2y);
  const iaaIdeal: RatioIdeal = { min: 85, max: 95 };

  // 5. ICD — Intercanthal ratio (eye width / intercanthal distance)
  const icdVal = eyeWidth / intercanthalDist;
  const icdIdeal: RatioIdeal = { min: 0.93, max: 1.05 };

  // 6. Eye Aspect Ratio
  const rEyeHeight = dist(rEyeTop, rEyeBot);
  const lEyeHeight = dist(lEyeTop, lEyeBot);
  const eyeHeight = (rEyeHeight + lEyeHeight) / 2;
  const earVal = eyeWidth / eyeHeight;
  const earIdeal: RatioIdeal = { min: 3, max: 3.6 };

  // 7. EME — Eye-Mouth-Eye angle
  const halfIPD = interpupilDist / 2;
  const vertMouthDist = verticalDist(pupilMid, mouthMid);
  const emeVal = Math.atan2(vertMouthDist, halfIPD) * (180 / Math.PI);
  const emeIdeal: RatioIdeal = { min: 45, max: 49 };

  // 8. Jaw Frontal Angle — angle at chin between mandible lines
  const jfaV1x = goniaR.x - chin.x;
  const jfaV1y = goniaR.y - chin.y;
  const jfaV2x = goniaL.x - chin.x;
  const jfaV2y = goniaL.y - chin.y;
  const jfaVal = angleBetweenVectors(jfaV1x, jfaV1y, jfaV2x, jfaV2y);
  const jfaIdeal: RatioIdeal = { min: 85, max: 95 };

  // 9. Lower Full Face Ratio
  const lffVal = (nasionToChin / totalFaceHeight) * 100;
  const lffIdeal: RatioIdeal = { min: 67, max: 71 };

  // 10. Jaw Width
  const jawWidthVal = bigonialWidth / bizygoWidth;
  const jawWidthIdeal: RatioIdeal = { min: 0.86, max: 0.92 };

  // 11. Facial Thirds (as % of total face height)
  const upperThird = hairlineToGlabella / totalFaceHeight * 100;
  const midThird = verticalDist(glabella, alarMid) / totalFaceHeight * 100;
  const lowerThird = verticalDist(alarMid, chin) / totalFaceHeight * 100;
  // Express as deviation from ideal [33, 31, 36]
  const thirdsDeviation = (
    Math.abs(upperThird - 33) +
    Math.abs(midThird - 31) +
    Math.abs(lowerThird - 36)
  ) / 3;
  const thirdsVal = thirdsDeviation; // lower = better
  const thirdsIdeal: RatioIdeal = { min: 0, max: 2 }; // within 2% avg deviation = ideal

  // 12. Facial Fifths (deviation from equal fifths)
  const earToLatR = dist(earR, rEyeLat);
  const latToMedR = rEyeWidth;
  const icd = intercanthalDist;
  const latToMedL = lEyeWidth;
  const earToLatL = dist(earL, lEyeLat);
  const totalWidth = earToLatR + latToMedR + icd + latToMedL + earToLatL;
  const fifth = totalWidth / 5;
  const fifthsDeviation = (
    Math.abs(earToLatR - fifth) +
    Math.abs(latToMedR - fifth) +
    Math.abs(icd - fifth) +
    Math.abs(latToMedL - fifth) +
    Math.abs(earToLatL - fifth)
  ) / fifth * 100 / 5;
  const fifthsVal = fifthsDeviation;
  const fifthsIdeal: RatioIdeal = { min: 0, max: 5 }; // within 5% avg deviation = ideal

  // 13. FWHR
  const fwhrVal = bizygoWidth / glabellaToUpperLip;
  const fwhrIdeal: RatioIdeal = { min: 1.9, max: 2.05 };

  // 14. TFWHR
  const tfwhrVal = totalFaceHeight / bizygoWidth;
  const tfwhrIdeal: RatioIdeal = { min: 1.33, max: 1.38 };

  // 15. IAA:JFA difference
  const iaaJfaVal = iaaVal - jfaVal;
  const iaaJfaIdeal: RatioIdeal = { min: 0, max: 3 };

  // 16. Midface Ratio
  const midfaceVal = interpupilDist / glabellaToUpperLip;
  const midfaceIdeal: RatioIdeal = { min: 0.96, max: 1.02 };

  // 17. Nose H:W
  const noseHWVal = noseHeight / noseWidth;
  const noseHWIdeal: RatioIdeal = { min: 1.44, max: 1.52 };

  // 18. Nose to Bizygo
  const noseBizygoVal = bizygoWidth / noseWidth;
  const noseBizygoIdeal: RatioIdeal = { min: 3.85, max: 4.15 };

  // 19. Lower:Upper Lip
  const upperLipHeight = verticalDist(upperLipTop, upperLipIn);
  const lowerLipHeight = verticalDist(lowerLipIn, lowerLipBot);
  const lipRatioVal = lowerLipHeight / upperLipHeight;
  const lipRatioIdeal: RatioIdeal = { min: 1.4, max: 2 };

  // 20. Chin to Philtrum
  const chinToLowerLip = verticalDist(lowerLipBot, chin);
  const alarToUpperLip = verticalDist(upperLipTop, alarMid);
  // alarToUpperLip: from upper lip top UP to alar base is negative in y-down coords, take abs
  const chinToPhiltrumVal = chinToLowerLip / Math.abs(alarToUpperLip);
  const chinToPhiltrumIdeal: RatioIdeal = { min: 2.1, max: 2.75 };

  // 21. Mouth to Bigonial
  const mouthBigonialVal = (mouthWidth / bigonialWidth) * 100;
  const mouthBigonialIdeal: RatioIdeal = { min: 40, max: 48 };

  // 22. Mouth to Nose
  const mouthNoseVal = mouthWidth / noseWidth;
  const mouthNoseIdeal: RatioIdeal = { min: 1.45, max: 1.83 };

  // 23. Bitemporal
  const bitemporalVal = (temporalWidth / bizygoWidth) * 100;
  const bitemporalIdeal: RatioIdeal = { min: 85, max: 95 };

  // 24. Forehead Length
  const foreheadLengthVal = temporalWidth / hairlineToGlabella;
  const foreheadLengthIdeal: RatioIdeal = { min: 0.45, max: 0.52 };

  const results: Array<{
    key: string;
    name: string;
    abbr: string;
    value: number;
    ideal: RatioIdeal;
    unit: string;
    description: string;
  }> = [
    { key: "esr", name: "Eye Separation Ratio", abbr: "ESR", value: esrVal, ideal: esrIdeal, unit: "%", description: "Pupil distance as % of bizygomatic width" },
    { key: "canthal", name: "Canthal Tilt", abbr: "CT", value: canthalVal, ideal: canthalIdeal, unit: "°", description: "Angle of eye axis — outer corner above inner corner" },
    { key: "pfl", name: "PFL to Bizygo", abbr: "PFL", value: pflVal, ideal: pflIdeal, unit: "%", description: "Eye fissure length as % of bizygomatic width" },
    { key: "iaa", name: "Infraorbital Alar Angle", abbr: "IAA", value: iaaVal, ideal: iaaIdeal, unit: "°", description: "Angle at alar base formed by lines to lateral canthi" },
    { key: "icd", name: "Intercanthal Ratio", abbr: "ICD", value: icdVal, ideal: icdIdeal, unit: "×", description: "Eye width divided by intercanthal distance" },
    { key: "ear", name: "Eye Aspect Ratio", abbr: "EAR", value: earVal, ideal: earIdeal, unit: "×", description: "Horizontal eye length divided by vertical height" },
    { key: "eme", name: "Eye-Mouth-Eye Angle", abbr: "EME", value: emeVal, ideal: emeIdeal, unit: "°", description: "Angle from pupil midpoint to mouth center" },
    { key: "jfa", name: "Jaw Frontal Angle", abbr: "JFA", value: jfaVal, ideal: jfaIdeal, unit: "°", description: "Angle at chin between the two mandible lines" },
    { key: "lff", name: "Lower Full Face Ratio", abbr: "LFF", value: lffVal, ideal: lffIdeal, unit: "%", description: "Nasion-to-chin as % of total face height" },
    { key: "jaww", name: "Jaw Width", abbr: "JW", value: jawWidthVal, ideal: jawWidthIdeal, unit: "×", description: "Bigonial width divided by bizygomatic width" },
    { key: "thirds", name: "Facial Thirds", abbr: "F3", value: thirdsVal, ideal: thirdsIdeal, unit: "% dev", description: "Avg deviation from ideal thirds (33 / 31 / 36)" },
    { key: "fifths", name: "Facial Fifths", abbr: "F5", value: fifthsVal, ideal: fifthsIdeal, unit: "% dev", description: "Avg deviation from equal facial fifths" },
    { key: "fwhr", name: "Face Width-Height Ratio", abbr: "FWHR", value: fwhrVal, ideal: fwhrIdeal, unit: "×", description: "Bizygomatic width / glabella-to-upper-lip height" },
    { key: "tfwhr", name: "Total Face Width-Height Ratio", abbr: "TFWHR", value: tfwhrVal, ideal: tfwhrIdeal, unit: "×", description: "Total face height divided by bizygomatic width" },
    { key: "iaaJfa", name: "IAA–JFA Difference", abbr: "IAA:JFA", value: Math.abs(iaaJfaVal), ideal: iaaJfaIdeal, unit: "°", description: "Absolute difference between IAA and JFA" },
    { key: "midface", name: "Midface Ratio", abbr: "MFR", value: midfaceVal, ideal: midfaceIdeal, unit: "×", description: "Interpupil distance / glabella-to-upper-lip height" },
    { key: "noseHW", name: "Nose Height to Width", abbr: "N H:W", value: noseHWVal, ideal: noseHWIdeal, unit: "×", description: "Nose height (glabella to alar base) / nose width" },
    { key: "noseBizygo", name: "Nose to Bizygo", abbr: "N:BZ", value: noseBizygoVal, ideal: noseBizygoIdeal, unit: "×", description: "Bizygomatic width divided by nose width" },
    { key: "lipRatio", name: "Lower-to-Upper Lip", abbr: "L:U Lip", value: lipRatioVal, ideal: lipRatioIdeal, unit: "×", description: "Lower lip height divided by upper lip height" },
    { key: "chinPhil", name: "Chin to Philtrum", abbr: "C:Ph", value: chinToPhiltrumVal, ideal: chinToPhiltrumIdeal, unit: "×", description: "Chin-to-lower-lip / alar-base-to-upper-lip" },
    { key: "mouthBigon", name: "Mouth to Bigonial", abbr: "M:BG", value: mouthBigonialVal, ideal: mouthBigonialIdeal, unit: "%", description: "Mouth width as % of bigonial width" },
    { key: "mouthNose", name: "Mouth to Nose", abbr: "M:N", value: mouthNoseVal, ideal: mouthNoseIdeal, unit: "×", description: "Mouth width divided by nose width" },
    { key: "bitemporal", name: "Bitemporal Ratio", abbr: "BT", value: bitemporalVal, ideal: bitemporalIdeal, unit: "%", description: "Temporal ridge width as % of bizygomatic width" },
    { key: "forehead", name: "Forehead Length", abbr: "FHL", value: foreheadLengthVal, ideal: foreheadLengthIdeal, unit: "×", description: "Temporal width / hairline-to-glabella height" },
  ];

  return results.map((r) => ({
    ...r,
    score: score(r.value, r.ideal),
    deviation: deviation(r.value, r.ideal),
  }));
}

// Landmark pairs to draw on canvas for visual reference
export const DRAW_CONNECTIONS: [number, number][] = [
  // Eye contours (simplified)
  [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  [133, 155], [155, 154], [154, 153], [153, 145], [145, 144], [144, 163], [163, 7], [7, 33],
  [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 362],
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390], [390, 249], [249, 263],
  // Lips
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
  // Nose bridge
  [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1], [1, 19], [19, 94],
  // Silhouette
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
  [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
  [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103],
  [103, 67], [67, 109], [109, 10],
];
