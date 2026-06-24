import { LM, Landmarks, getPoint, avgPoints } from "./landmarks";

export interface Point {
  x: number;
  y: number;
}

export interface KeyPointPositions {
  hairline:      Point;
  glabella:      Point;
  nasion:        Point;
  temporal_r:    Point;
  temporal_l:    Point;
  ear_r:         Point;
  ear_l:         Point;
  zygo_r:        Point;
  zygo_l:        Point;
  gonia_r:       Point;
  gonia_l:       Point;
  jaw_r:         Point;
  jaw_l:         Point;
  chin:          Point;
  jaw_apex:      Point; // point below chin to measure jaw frontal angle

  r_eye_lat:     Point;
  r_eye_med:     Point;
  l_eye_lat:     Point;
  l_eye_med:     Point;
  r_eye_top:     Point;
  r_eye_bot:     Point;
  l_eye_top:     Point;
  l_eye_bot:     Point;
  mid_eyebrow:   Point;

  r_pupil:       Point;
  l_pupil:       Point;
  mid_pupil:     Point;

  alar_r:        Point;
  alar_l:        Point;
  nose_w_r:      Point;
  nose_w_l:      Point;
  subnasale:     Point;

  upper_lip_top: Point;
  lower_lip_bot: Point;
  mouth_r:       Point;
  mouth_l:       Point;
  lip_center:    Point;
}

export type PointKey = keyof KeyPointPositions;

export const KEY_POINT_DEFS: Record<PointKey, { label: string; color: string }> = {
  hairline:      { label: "Hairline",        color: "#a78bfa" },
  glabella:      { label: "Glabella",        color: "#a78bfa" },
  temporal_r:    { label: "Temporal (R)",    color: "#a78bfa" },
  temporal_l:    { label: "Temporal (L)",    color: "#a78bfa" },
  nasion:        { label: "Nasion",          color: "#fbbf24" },
  subnasale:     { label: "Subnasale",       color: "#fbbf24" },
  alar_r:        { label: "Alar (R)",        color: "#fbbf24" },
  alar_l:        { label: "Alar (L)",        color: "#fbbf24" },
  nose_w_r:      { label: "Nose Width (R)",  color: "#fbbf24" },
  nose_w_l:      { label: "Nose Width (L)",  color: "#fbbf24" },
  r_eye_lat:     { label: "Outer Eye (R)",   color: "#34d399" },
  r_eye_med:     { label: "Inner Eye (R)",   color: "#34d399" },
  l_eye_lat:     { label: "Outer Eye (L)",   color: "#34d399" },
  l_eye_med:     { label: "Inner Eye (L)",   color: "#34d399" },
  r_eye_top:     { label: "Upper Eye (R)",   color: "#34d399" },
  r_eye_bot:     { label: "Lower Eye (R)",   color: "#34d399" },
  l_eye_top:     { label: "Upper Eye (L)",   color: "#34d399" },
  l_eye_bot:     { label: "Lower Eye (L)",   color: "#34d399" },
  mid_eyebrow:   { label: "Mid Eyebrow",     color: "#34d399" },
  r_pupil:       { label: "Pupil (R)",       color: "#34d399" },
  l_pupil:       { label: "Pupil (L)",       color: "#34d399" },
  mid_pupil:     { label: "Mid Pupil",       color: "#34d399" },
  upper_lip_top:{ label: "Upper Lip",      color: "#f472b6" },
  lower_lip_bot:{ label: "Lower Lip",      color: "#f472b6" },
  mouth_r:       { label: "Mouth Corner (R)",color: "#f472b6" },
  mouth_l:       { label: "Mouth Corner (L)",color: "#f472b6" },
  lip_center:   { label: "Lip Center",       color: "#f472b6" },
  ear_r:         { label: "Ear (R)",         color: "#60a5fa" },
  ear_l:         { label: "Ear (L)",         color: "#60a5fa" },
  zygo_r:        { label: "Zygo (R)",        color: "#60a5fa" },
  zygo_l:        { label: "Zygo (L)",        color: "#60a5fa" },
  gonia_r:       { label: "Gonia (R)",       color: "#60a5fa" },
  gonia_l:       { label: "Gonia (L)",       color: "#60a5fa" },
  jaw_r:         { label: "Jaw (R)",         color: "#60a5fa" },
  jaw_l:         { label: "Jaw (L)",         color: "#60a5fa" },
  chin:          { label: "Chin",            color: "#60a5fa" },
  jaw_apex:      { label: "Jaw Apex",        color: "#60a5fa" },
};

export function extractKeyPoints(
  landmarks: Landmarks,
  imgW: number,
  imgH: number,
): KeyPointPositions {
  const get = (idx: number) => getPoint(landmarks, idx, imgW, imgH);
  const avg = (indices: readonly number[]) => avgPoints(landmarks, indices, imgW, imgH);

  const chin = get(LM.CHIN);
  const jaw_r = get(LM.JAW_R);
  const jaw_l = get(LM.JAW_L);
  const r_pupil = avg(LM.R_IRIS_RING);
  const l_pupil = avg(LM.L_IRIS_RING);
  const r_eye_top = get(LM.R_EYE_TOP);
  const l_eye_top = get(LM.L_EYE_TOP);

  // To get a consistent jaw frontal angle, we need to create a
  // stable apex point below the chin.
  const jaw_apex = {
    x: chin.x,
    // Use the vertical distance from the jaw to the chin as a heuristic for how far down
    // the apex should be.
    y: chin.y + 0.5 * (Math.abs(jaw_r.y - chin.y) + Math.abs(jaw_l.y - chin.y)),
  }

  return {
    hairline:      get(LM.HAIRLINE),
    glabella:      get(LM.GLABELLA),
    nasion:        get(LM.NASION),
    temporal_r:    get(LM.TEMPORAL_R),
    temporal_l:    get(LM.TEMPORAL_L),
    ear_r:         get(LM.EAR_R),
    ear_l:         get(LM.EAR_L),
    zygo_r:        get(LM.ZYGO_R),
    zygo_l:        get(LM.ZYGO_L),
    gonia_r:       get(LM.GONIA_R),
    gonia_l:       get(LM.GONIA_L),
    jaw_r:         jaw_r,
    jaw_l:         jaw_l,
    chin:          chin,
    jaw_apex:      jaw_apex,

    r_eye_lat:     get(LM.R_EYE_LATERAL),
    r_eye_med:     get(LM.R_EYE_MEDIAL),
    l_eye_lat:     get(LM.L_EYE_LATERAL),
    l_eye_med:     get(LM.L_EYE_MEDIAL),
    r_eye_top:     r_eye_top,
    r_eye_bot:     get(LM.R_EYE_BOT),
    l_eye_top:     l_eye_top,
    l_eye_bot:     get(LM.L_EYE_BOT),
    mid_eyebrow:   { x: (r_eye_top.x + l_eye_top.x) / 2, y: (r_eye_top.y + l_eye_top.y) / 2 },

    r_pupil:       r_pupil,
    l_pupil:       l_pupil,
    mid_pupil:     { x: (r_pupil.x + l_pupil.x) / 2, y: (r_pupil.y + l_pupil.y) / 2 },

    alar_r:        get(LM.ALAR_R),
    alar_l:        get(LM.ALAR_L),
    nose_w_r:      get(LM.NOSE_W_R),
    nose_w_l:      get(LM.NOSE_W_L),
    subnasale:     get(LM.SUBNASALE),

    upper_lip_top: get(LM.UPPER_LIP_TOP),
    lower_lip_bot: get(LM.LOWER_LIP_BOT),
    mouth_r:       get(LM.MOUTH_R),
    mouth_l:       get(LM.MOUTH_L),
    lip_center:    get(13), // center of mouth, between lips
  };
}
