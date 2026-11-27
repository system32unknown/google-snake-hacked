import GoogMap from "../../goog/structs/GoogMap.js";

export const NORMAL_BODY = [111, 114, 112, 113];
export const NORMAL_TAIL = [173, 176, 174, 175];
export const NORMAL_HEAD = [159, 162, 160, 161];

export const LOOK_LEFT = [155, 158, 156, 157];
export const LOOK_RIGHT = [163, 166, 164, 165];
export const LOWBODY_TURN = [107, 110, 108, 109];

export const SHOCK_1 = [197, 200, 198, 199];
export const SHOCK_2 = [193, 196, 194, 195];
export const DIZZY_1 = [189, 192, 190, 191];
export const DIZZY_2 = [185, 188, 186, 187];
export const DIZZY_3 = [181, 184, 182, 183];
export const DIZZY_4 = [177, 180, 178, 179];
export const BLINK_1 = [143, 146, 144, 145];
export const BLINK_2 = [147, 150, 148, 149];
export const BLINK_3 = [151, 154, 152, 153];

const Zc = [261, 264, 262, 263];
const $c = [269, 272, 270, 271];
const ad = [277, 280, 278, 279];
const bd = [285, 288, 286, 287];
const cd = [293, 296, 294, 295];
const dd = [257, 260, 258, 259];
const ed = [265, 268, 266, 267];
const fd = [273, 276, 274, 275];
const gd = [281, 284, 282, 283];
const hd = [289, 292, 290, 291];
const id = [217, 220, 218, 219];
const jd = [225, 228, 226, 227];
const kd = [233, 236, 234, 235];
const ld = [241, 244, 242, 243];
const md = [249, 252, 250, 251];
const nd = [221, 224, 222, 223];
const od = [229, 232, 230, 231];
const pd = [237, 240, 238, 239];
const qd = [245, 248, 246, 247];
const rd = [253, 256, 254, 255];

export const tc = [
  [Zc, $c, ad, bd, cd],
  [dd, ed, fd, gd, hd],
  [nd, od, pd, qd, rd],
  [id, jd, kd, ld, md],
];

export const Oe = tc[0];
export const Pe = tc[1];
export const Qe = tc[2];
export const Re = tc[3];

// Sprite frame sets for each segment type
export const SegmentFrames = Object.freeze({
  0: NORMAL_HEAD,  // Head
  1: NORMAL_BODY,  // Body
  2: NORMAL_TAIL   // Tail
});

// Build a configuration set (rc) with many keys enabled
export const enabledSet = new GoogMap();
enabledSet.set(NORMAL_TAIL, true);
enabledSet.set(LOWBODY_TURN, true);
enabledSet.set(id, true);
enabledSet.set(jd, true);
enabledSet.set(kd, true);
enabledSet.set(ld, true);
enabledSet.set(md, true);
enabledSet.set(nd, true);
enabledSet.set(od, true);
enabledSet.set(pd, true);
enabledSet.set(qd, true);
enabledSet.set(rd, true);

// Another configuration set (sc) with a different set of keys
export const otherSet = new GoogMap();
otherSet.set(Zc, true);
otherSet.set($c, true);
otherSet.set(ad, true);
otherSet.set(bd, true);
otherSet.set(cd, true);
otherSet.set(id, true);
otherSet.set(jd, true);
otherSet.set(kd, true);
otherSet.set(ld, true);
otherSet.set(md, true);