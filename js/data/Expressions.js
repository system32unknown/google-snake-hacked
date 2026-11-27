import { BLINK_1, BLINK_2, BLINK_3, SHOCK_1, SHOCK_2, DIZZY_1, DIZZY_2, DIZZY_3, DIZZY_4, LOOK_LEFT, LOOK_RIGHT } from "./Anim_Data.js";

export const EYE_CLOSE = [BLINK_1, BLINK_2, BLINK_3];
export const BLINK = EYE_CLOSE.slice().concat([BLINK_2, BLINK_1]);
export const NUDGE = [
  [139, 142, 140, 141],
  [135, 138, 136, 137],
  [131, 134, 132, 133],
  [127, 130, 128, 129]
];
export const EAT_ANIM = [
  [123, 126, 124, 125],
  [119, 122, 120, 121],
  [115, 118, 116, 117]
];

export const DIZZY = [DIZZY_1, DIZZY_2, DIZZY_3, DIZZY_4];
export const SHOCK = [SHOCK_1, SHOCK_2].concat(DIZZY);
export const LOOK_AROUND = [LOOK_LEFT, LOOK_RIGHT, LOOK_LEFT, LOOK_RIGHT];

export const HAPPY_HEAD = [201, 204, 202, 203];
export const BITTER = [209, 212, 210, 211];
export const REVERSAL = [205, 208, 206, 207];
export const LOST_HEAD = [213, 216, 214, 215];