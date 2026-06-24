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
  score: number | null;
  deviation: number | null;
  description: string;
}

function scoreResult(value: number, ideal: RatioIdeal): number {
  const range = ideal.max - ideal.min;

  // Handle single-point ideals (range === 0)
  if (range === 0) {
    const distance = Math.abs(value - ideal.min);
    const base = ideal.min === 0 ? 1 : ideal.min; // Avoid division by zero
    // A deviation of 10% of the ideal value drops score to 7.5
    const score = 10 - 25 * (distance / base);
    const finalScore = Math.max(0, score);
    return Math.round(finalScore * 10) / 10;
  }

  // For ranged ideals, score is 10 at the midpoint, and 9 at the edges of the ideal range.
  const midpointValue = (ideal.min + ideal.max) / 2;
  const distanceFromMidpoint = Math.abs(value - midpointValue);

  // We want the score to be 9 at the boundary of the ideal range.
  // At the boundary, `distanceFromMidpoint` is `range / 2`.
  // The formula is `score = 10 - C * (distanceFromMidpoint / range)`.
  // We want `9 = 10 - C * ((range / 2) / range)`.
  // This simplifies to `9 = 10 - C * 0.5`.
  // So, `1 = C * 0.5`, which means `C = 2`.
  const C = 2;
  const score = 10 - C * (distanceFromMidpoint / range);

  // Clamp the score and round it.
  const finalScore = Math.max(0, score);
  return Math.round(finalScore * 10) / 10;
}

function deviationPct(value: number, ideal: RatioIdeal): number {
  if (value >= ideal.min && value <= ideal.max) return 0;
  const range = ideal.max - ideal.min;
  if (range === 0) {
      if (ideal.min === 0) return value * 100; // special case, it's just a % deviation
      return (Math.abs(value - ideal.min) / ideal.min) * 100;
  }
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
    jaw_r, jaw_l, chin, jaw_apex,
    r_eye_lat, r_eye_med, l_eye_lat, l_eye_med,
    r_eye_top, r_eye_bot, l_eye_top, l_eye_bot,
    r_eyebrow_l, r_eyebrow_r, r_eyebrow_top, r_eyebrow_bot,
    l_eyebrow_l, l_eyebrow_r, l_eyebrow_top, l_eyebrow_bot,
    r_pupil, l_pupil,
    alar_r, alar_l,
    nose_w_r, nose_w_l, subnasale,
    nose_bridge_l, nose_bridge_r,
    upper_lip_top, lower_lip_bot,
    mouth_r, mouth_l, lip_center,
    neck_l, neck_r,
  } = kp;

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
  const neckWidth = dist(neck_l, neck_r);
  const totalFaceHeight = verticalDist(hairline, chin);
  const fwhrMidfaceHeight = verticalDist(midpoint(r_eye_top, l_eye_top), upper_lip_top);
  const midMidfaceHeight = verticalDist(midpoint(r_pupil, l_pupil), upper_lip_top);
  const noseHeight = verticalDist(nasion, subnasale);
  const nasionToChin = verticalDist(nasion, chin);
  const philtrumHeight = verticalDist(subnasale, upper_lip_top);

  const esrVal = (interpupilDist / bizygoWidth) * 100;
  const esrIdeal = { min: 44.5, max: 47.75 };

  const rTilt = canthalTilt(r_eye_med, r_eye_lat);
  const lTilt = canthalTilt(l_eye_med, l_eye_lat);
  const canthalVal = (rTilt + lTilt) / 2;
  const canthalIdeal = { min: 5, max: 8.5 };

  const pflVal = (eyeWidth / bizygoWidth) * 100;
  const pflIdeal = { min: 19.5, max: 21.5 };

  const iaaV1x = r_eye_lat.x - subnasale.x;
  const iaaV1y = r_eye_lat.y - subnasale.y;
  const iaaV2x = l_eye_lat.x - subnasale.x;
  const iaaV2y = l_eye_lat.y - subnasale.y;
  const iaaVal = angleBetweenVectors(iaaV1x, iaaV1y, iaaV2x, iaaV2y);
  const iaaIdeal = { min: 85, max: 95 };

  const icdVal = eyeWidth / intercanthalDist;
  const icdIdeal = { min: 0.93, max: 1.05 };

  const rEyeH = dist(r_eye_top, r_eye_bot);
  const lEyeH = dist(l_eye_top, l_eye_bot);
  const eyeH = (rEyeH + lEyeH) / 2;
  const earVal = eyeWidth / eyeH;
  const earIdeal = { min: 3, max: 3.6 };

  const emeV1x = r_pupil.x - lip_center.x;
  const emeV1y = r_pupil.y - lip_center.y;
  const emeV2x = l_pupil.x - lip_center.x;
  const emeV2y = l_pupil.y - lip_center.y;
  const emeVal = angleBetweenVectors(emeV1x, emeV1y, emeV2x, emeV2y);
  const emeIdeal = { min: 45, max: 49 };

  const jfaV1x = jaw_r.x - jaw_apex.x;
  const jfaV1y = jaw_r.y - jaw_apex.y;
  const jfaV2x = jaw_l.x - jaw_apex.x;
  const jfaV2y = jaw_l.y - jaw_apex.y;
  const jfaVal = angleBetweenVectors(jfaV1x, jfaV1y, jfaV2x, jfaV2y);
  const jfaIdeal = { min: 88, max: 92 };

  const lffVal = (nasionToChin / totalFaceHeight) * 100;
  const lffIdeal = { min: 67, max: 71 };

  const jawWidthVal = bigonialWidth / bizygoWidth;
  const jawWidthIdeal = { min: 0.86, max: 0.92 };

  const upperThird = (verticalDist(hairline, glabella) / totalFaceHeight) * 100;
  const midThird = (verticalDist(glabella, subnasale) / totalFaceHeight) * 100;
  const lowerThird = (verticalDist(subnasale, chin) / totalFaceHeight) * 100;
  const thirdsVal = (Math.abs(upperThird - 33) + Math.abs(midThird - 31) + Math.abs(lowerThird - 36)) / 3;
  const thirdsIdeal = { min: 0, max: 2 };

  const earToLatR = dist(ear_r, r_eye_lat);
  const earToLatL = dist(ear_l, l_eye_lat);
  const totalWidth = earToLatR + rEyeWidth + intercanthalDist + lEyeWidth + earToLatL;
  const fifth = totalWidth / 5;
  const fifthsVal = (
    Math.abs(earToLatR - fifth) +
    Math.abs(rEyeWidth - fifth) +
    Math.abs(intercanthalDist - fifth) +
    Math.abs(lEyeWidth - fifth) +
    Math.abs(earToLatL - fifth)
  ) / fifth * 100 / 5;
  const fifthsIdeal = { min: 0, max: 5 };

  const fwhrVal = bizygoWidth / fwhrMidfaceHeight;
  const fwhrIdeal = { min: 1.9, max: 2.05 };

  const tfwhrVal = totalFaceHeight / bizygoWidth;
  const tfwhrIdeal = { min: 1.33, max: 1.38 };

  const iaaJfaVal = Math.abs(iaaVal - jfaVal);
  const iaaJfaIdeal = { min: 0, max: 3 };

  const midfaceVal = interpupilDist / midMidfaceHeight;
  const midfaceIdeal = { min: 0.96, max: 1.02 };

  const noseHWVal = noseHeight / noseWidth;
  const noseHWIdeal = { min: 1.44, max: 1.52 };

  const noseBizygoVal = bizygoWidth / noseWidth;
  const noseBizygoIdeal = { min: 3.85, max: 4.15 };

  const upperLipH = verticalDist(upper_lip_top, lip_center);
  const lowerLipH = verticalDist(lip_center, lower_lip_bot);
  const lipRatioVal = lowerLipH / upperLipH;
  const lipRatioIdeal = { min: 1.4, max: 2 };

  const chinToLowerLip = verticalDist(lower_lip_bot, chin);
  const chinToPhiltrumVal = chinToLowerLip / philtrumHeight;
  const chinToPhiltrumIdeal = { min: 2.1, max: 2.75 };

  const mouthBigonialVal = (mouthWidth / bigonialWidth) * 100;
  const mouthBigonialIdeal = { min: 40, max: 48 };

  const mouthNoseVal = mouthWidth / noseWidth;
  const mouthNoseIdeal = { min: 1.45, max: 1.83 };

  const bitemporalVal = (temporalWidth / bizygoWidth) * 100;
  const bitemporalIdeal = { min: 85, max: 95 };

  const foreheadLengthVal = temporalWidth / verticalDist(hairline, glabella);
  const foreheadLengthIdeal = { min: 1.85, max: 2.15 };

  const lowerThirdVal = (verticalDist(subnasale, chin) / totalFaceHeight) * 100;
  const lowerThirdIdeal = { min: 35.45, max: 35.45 };

  const topThirdVal = (verticalDist(hairline, glabella) / totalFaceHeight) * 100;
  const topThirdIdeal = { min: 31, max: 31 };

  const middleThirdVal = (verticalDist(glabella, subnasale) / totalFaceHeight) * 100;
  const middleThirdIdeal = { min: 32.4, max: 32.4 };

  const cheekboneHeightVal = (1 - (verticalDist(l_pupil, zygo_l) / verticalDist(l_eye_top, nasion))) * 100;
  const cheekboneHeightIdeal = { min: 91.5, max: 91.5 };

  const eyebrowLowsetnessVal = verticalDist(l_eyebrow_bot, l_pupil) / eyeWidth;
  const eyebrowLowsetnessIdeal = { min: 0.25, max: 0.25 };

  const browLengthToFaceWidthVal = dist(l_eyebrow_l, r_eyebrow_r) / bizygoWidth;
  const browLengthToFaceWidthIdeal = { min: 0.75, max: 0.75 };

  const lEyebrowTilt = canthalTilt(l_eyebrow_r, l_eyebrow_l);
  const rEyebrowTilt = canthalTilt(r_eyebrow_l, r_eyebrow_r);
  const eyebrowTiltVal = (lEyebrowTilt + rEyebrowTilt) / 2;
  const eyebrowTiltIdeal = { min: 8.75, max: 8.75 };

  const noseWidthToNoseBridgeWidthVal = noseWidth / dist(nose_bridge_l, nose_bridge_r);
  const noseWidthToNoseBridgeWidthIdeal = { min: 2.1, max: 2.1 };

  const intercanthalToNoseWidthVal = intercanthalDist / noseWidth;
  const intercanthalToNoseWidthIdeal = { min: 1.1, max: 1.1 };

  const icdToMouthWidthRatioVal = intercanthalDist / mouthWidth;
  const icdToMouthWidthRatioIdeal = { min: 0.85, max: 0.85 };

  const lowerThirdProportionVal = verticalDist(subnasale, upper_lip_top) / verticalDist(subnasale, chin);
  const lowerThirdProportionIdeal = { min: 32.25, max: 32.25 };

  const neckWidthVal = neckWidth / bigonialWidth * 100;
  const neckWidthIdeal = { min: 95, max: 95 };

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
    { key: "eme",        name: "Eye-Mouth-Eye Angle",       abbr: "EME",     value: emeVal,             ideal: emeIdeal,            unit: "°",     description: "Angle at lip center between lines to each pupil" },
    { key: "jfa",        name: "Jaw Frontal Angle",         abbr: "JFA",     value: jfaVal,             ideal: jfaIdeal,            unit: "°",     description: "Angle at chin between the two mandible lines" },
    { key: "lff",        name: "Lower Full Face Ratio",     abbr: "LFF",     value: lffVal,             ideal: lffIdeal,            unit: "%",     description: "Nasion-to-chin as % of total face height" },
    { key: "jaww",       name: "Jaw Width",                 abbr: "JW",      value: jawWidthVal,        ideal: jawWidthIdeal,       unit: "×",     description: "Bigonial width divided by bizygomatic width" },
    { key: "thirds",     name: "Facial Thirds",             abbr: "F3",      value: thirdsVal,          ideal: thirdsIdeal,         unit: "% dev", description: "Avg deviation from ideal thirds (33 / 31 / 36)" },
    { key: "fifths",     name: "Facial Fifths",             abbr: "F5",      value: fifthsVal,          ideal: fifthsIdeal,         unit: "% dev", description: "Avg deviation from equal facial fifths" },
    { key: "fwhr",       name: "Face Width-Height Ratio",   abbr: "FWHR",    value: fwhrVal,            ideal: fwhrIdeal,           unit: "×",     description: "Bizygomatic width ÷ mid-eyebrow-to-lip height" },
    { key: "tfwhr",      name: "Total Face W-H Ratio",      abbr: "TFWHR",   value: tfwhrVal,           ideal: tfwhrIdeal,          unit: "×",     description: "Total face height divided by bizygomatic width" },
    { key: "iaaJfa",     name: "IAA–JFA Difference",        abbr: "IAA:JFA", value: iaaJfaVal,          ideal: iaaJfaIdeal,         unit: "°",     description: "Absolute difference between IAA and JFA angles" },
    { key: "midface",    name: "Midface Ratio",             abbr: "MFR",     value: midfaceVal,         ideal: midfaceIdeal,        unit: "×",     description: "Interpupil distance ÷ mid-pupil-to-lip height" },
    { key: "noseHW",     name: "Nose Height to Width",      abbr: "N H:W",   value: noseHWVal,          ideal: noseHWIdeal,         unit: "×",     description: "Nose height (nasion → subnasale) ÷ nose width" },
    { key: "noseBizygo", name: "Nose to Bizygo",            abbr: "N:BZ",    value: noseBizygoVal,      ideal: noseBizygoIdeal,     unit: "×",     description: "Bizygomatic width divided by nose width" },
    { key: "lipRatio",   name: "Lower-to-Upper Lip",        abbr: "L:U Lip", value: lipRatioVal,        ideal: lipRatioIdeal,       unit: "×",     description: "Lower lip height divided by upper lip height" },
    { key: "chinPhil",   name: "Chin to Philtrum",          abbr: "C:Ph",    value: chinToPhiltrumVal,  ideal: chinToPhiltrumIdeal, unit: "×",     description: "Chin-to-lower-lip height ÷ philtrum height (subnasale→upper lip)" },
    { key: "mouthBigon", name: "Mouth to Bigonial",         abbr: "M:BG",    value: mouthBigonialVal,   ideal: mouthBigonialIdeal,  unit: "%",     description: "Mouth width as % of bigonial (jaw) width" },
    { key: "mouthNose",  name: "Mouth to Nose",             abbr: "M:N",     value: mouthNoseVal,       ideal: mouthNoseIdeal,      unit: "×",     description: "Mouth width divided by nose width" },
    { key: "bitemporal", name: "Bitemporal Ratio",          abbr: "BT",      value: bitemporalVal,      ideal: bitemporalIdeal,     unit: "%",     description: "Temporal ridge width as % of bizygomatic width" },
    { key: "forehead",   name: "Forehead Length",           abbr: "FHL",     value: foreheadLengthVal,  ideal: foreheadLengthIdeal, unit: "×",     description: "Temporal width ÷ hairline-to-glabella height" },
    { key: "lowerThird", name: "Lower Third",               abbr: "L3",      value: lowerThirdVal,      ideal: lowerThirdIdeal,     unit: "%",     description: "Chin to subnasal / chin to hairline" },
    { key: "topThird", name: "Top Third",                 abbr: "T3",      value: topThirdVal,        ideal: topThirdIdeal,       unit: "%",     description: "Hairline to glabella / chin to hairline" },
    { key: "middleThird", name: "Middle Third",             abbr: "M3",      value: middleThirdVal,     ideal: middleThirdIdeal,    unit: "%",     description: "Glabella to subnasal / chin to hairline" },
    { key: "cheekboneHeight", name: "Cheekbone Height",         abbr: "CH",      value: cheekboneHeightVal, ideal: cheekboneHeightIdeal,unit: "%",     description: "(1 - (pupil height to Cheekbone Distance / Eye to Nose Base Distance)) * 100" },
    { key: "eyebrowLowsetness", name: "Eyebrow Lowsetness",     abbr: "EL",      value: eyebrowLowsetnessVal, ideal: eyebrowLowsetnessIdeal, unit: "×",     description: "Eyebrow bottom to pupil / Total Eye Width" },
    { key: "browLengthToFaceWidth", name: "Brow Length to Face Width", abbr: "BLFW",    value: browLengthToFaceWidthVal, ideal: browLengthToFaceWidthIdeal, unit: "×",     description: "Brow length / bizygomatic width" },
    { key: "eyebrowTilt", name: "Eyebrow Tilt",             abbr: "ET",      value: eyebrowTiltVal,     ideal: eyebrowTiltIdeal,    unit: "°",     description: "Angle of eyebrow axis" },
    { key: "noseWidthToNoseBridgeWidth", name: "Nose Width to Nose Bridge Width", abbr: "NWNBW", value: noseWidthToNoseBridgeWidthVal, ideal: noseWidthToNoseBridgeWidthIdeal, unit: "×",     description: "Nose width / nose bridge width" },
    { key: "intercanthalToNoseWidth", name: "Intercanthal to Nose Width", abbr: "ICNW",    value: intercanthalToNoseWidthVal, ideal: intercanthalToNoseWidthIdeal, unit: "×",     description: "Intercanthal distance / nose width" },
    { key: "icdToMouthWidthRatio", name: "ICD to Mouth Width Ratio", abbr: "IMWR",    value: icdToMouthWidthRatioVal, ideal: icdToMouthWidthRatioIdeal, unit: "×",     description: "Intercanthal distance / mouth width" },
    { key: "lowerThirdProportion", name: "Lower Third Proportion",    abbr: "L3P",     value: lowerThirdProportionVal, ideal: lowerThirdProportionIdeal, unit: "%",     description: "Subnasal to upper lip / subnasal to chin" },
    { key: "neckWidth", name: "Neck Width",               abbr: "NW",      value: neckWidthVal,       ideal: neckWidthIdeal,      unit: "%",     description: "Neck width / bigonial width" },
  ];

  return raw.map((r) => {
    if (r.value === null || !isFinite(r.value)) {
      return { ...r, value: null, score: null, deviation: null };
    }
    return {
      ...r,
      score: scoreResult(r.value, r.ideal),
      deviation: deviationPct(r.value, r.ideal),
    };
  });
}
