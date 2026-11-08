/**
 * Collage layout presets for the Home hero (P1)
 * Source: docs/DESIGN.md §6.1.1 & docs/INSPIRATION-ANALYSIS.md (Rabah reference)
 * 
 * STRICT RULE: The center region (x: 24%..70%, y: 22%..74%) is a NO-IMAGE ZONE
 * to ensure the centered editorial headline and CTA button are never covered.
 * Cards strictly frame the outer edges (top, bottom, left, right).
 */

export interface CollageSlot {
  id: number;
  x: number; // percentage (left)
  y: number; // percentage (top)
  widthVw: number; // vw units
  aspect: "3/4" | "4/5" | "1/1" | "16/9" | "2/3";
  depth: number;
  z: number;
  rotate?: number; // subtle angle e.g. -2, 1.5
  isLcp?: boolean;
}

export interface CollagePreset {
  id: string;
  name: string;
  description: string;
  slots: CollageSlot[];
}

export const collagePresets: CollagePreset[] = [
  {
    id: "preset-a",
    name: "Rabah Editorial Scattered Framing",
    description: "Organically scattered positions with subtle rotations and layered depths across the entire canvas.",
    slots: [
      // Organically distributed across full canvas — all vertical portrait aspect ratios (3/4, 4/5, 2/3)
      // so portraits are never trimmed or letterboxed into landscape ratios.
      { id: 0, x: 3.5, y: 8,   widthVw: 11.5, aspect: "3/4", depth: 0.9,  z: 10, rotate: -3.5, isLcp: true },
      { id: 1, x: 58,  y: 4,   widthVw: 11,   aspect: "4/5", depth: 0.8,  z: 8,  rotate: 2,    isLcp: true },
      { id: 2, x: 16,  y: 27,  widthVw: 12,   aspect: "4/5", depth: 1.1,  z: 12, rotate: -2,   isLcp: true },
      { id: 3, x: 84,  y: 9,   widthVw: 12,   aspect: "4/5", depth: 1.15, z: 14, rotate: 3,    isLcp: true },
      { id: 4, x: 2,   y: 55,  widthVw: 10.5, aspect: "2/3", depth: 1.25, z: 10, rotate: -3 },
      { id: 5, x: 34,  y: 4,   widthVw: 10.5, aspect: "4/5", depth: 0.75, z: 6,  rotate: -1.5 },
      { id: 6, x: 75,  y: 36,  widthVw: 13,   aspect: "3/4", depth: 1.3,  z: 11, rotate: -2.5 },
      { id: 7, x: 86,  y: 62,  widthVw: 10,   aspect: "3/4", depth: 0.85, z: 9,  rotate: 3.5 },
      { id: 8, x: 12,  y: 72,  widthVw: 12.5, aspect: "4/5", depth: 1.1,  z: 12, rotate: 2 },
      { id: 9, x: 65,  y: 72,  widthVw: 11.5, aspect: "4/5", depth: 0.85, z: 7,  rotate: -2 },
    ],
  },
  {
    id: "preset-b",
    name: "Editorial Gallery Columns",
    description: "Two columns flanking the headline with top/bottom anchors.",
    slots: [
      { id: 0, x: 4, y: 12, widthVw: 13, aspect: "3/4", depth: 1.05, z: 10, isLcp: true },
      { id: 1, x: 77, y: 18, widthVw: 15, aspect: "4/5", depth: 1.15, z: 14, isLcp: true },
      { id: 2, x: 6, y: 54, widthVw: 13, aspect: "4/5", depth: 0.95, z: 10, isLcp: true },
      { id: 3, x: 79, y: 56, widthVw: 14, aspect: "3/4", depth: 1.2, z: 12, isLcp: true },
      { id: 4, x: 26, y: 5, widthVw: 11, aspect: "4/5", depth: 0.75, z: 6 },
      { id: 5, x: 58, y: 5, widthVw: 11.5, aspect: "3/4", depth: 0.8, z: 6 },
      { id: 6, x: 3, y: 34, widthVw: 10, aspect: "2/3", depth: 1.3, z: 10 },
      { id: 7, x: 86, y: 36, widthVw: 10, aspect: "2/3", depth: 1.2, z: 10 },
      { id: 8, x: 28, y: 70, widthVw: 11.5, aspect: "4/5", depth: 0.85, z: 6 },
      { id: 9, x: 58, y: 69, widthVw: 12, aspect: "3/4", depth: 1.0, z: 8 },
    ],
  },
  {
    id: "preset-c",
    name: "Perimeter Cascade",
    description: "Outer perimeter placement leaving central viewing area untouched.",
    slots: [
      { id: 0, x: 4, y: 12, widthVw: 13, aspect: "4/5", depth: 1.15, z: 12, isLcp: true },
      { id: 1, x: 77, y: 20, widthVw: 15, aspect: "3/4", depth: 1.1, z: 14, isLcp: true },
      { id: 2, x: 8, y: 54, widthVw: 12, aspect: "4/5", depth: 0.9, z: 10, isLcp: true },
      { id: 3, x: 80, y: 56, widthVw: 14, aspect: "4/5", depth: 1.25, z: 12, isLcp: true },
      { id: 4, x: 32, y: 5, widthVw: 11, aspect: "3/4", depth: 0.8, z: 6 },
      { id: 5, x: 82, y: 13, widthVw: 11.5, aspect: "3/4", depth: 0.85, z: 7 },
      { id: 6, x: 3, y: 34, widthVw: 10, aspect: "2/3", depth: 1.3, z: 12 },
      { id: 7, x: 86, y: 38, widthVw: 10, aspect: "4/5", depth: 1.2, z: 10 },
      { id: 8, x: 44, y: 70, widthVw: 12, aspect: "4/5", depth: 0.75, z: 6 },
      { id: 9, x: 5, y: 68, widthVw: 10, aspect: "3/4", depth: 1.05, z: 10 },
    ],
  },
];
