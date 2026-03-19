import { BusRow } from "../components/BusSeatingChart";

export interface BusConfig {
  id: string;
  name: string;
  rows: BusRow[];
}

/** Generate n blank rows with auto‑incrementing seat numbers. */
function blankRows(totalRows: number): BusRow[] {
  return Array.from({ length: totalRows }, (_, i) => {
    const base = i * 4;
    return {
      leftWindow: { seatNumber: base + 1 },
      leftAisle: { seatNumber: base + 2 },
      rightAisle: { seatNumber: base + 3 },
      rightWindow: { seatNumber: base + 4 },
    };
  });
}

export const BUSES: BusConfig[] = [
  {
    id: "bus-1",
    name: "BSIT 3C",
    rows: blankRows(12),
  },
  {
    id: "bus-2",
    name: "BSIT 3B and BSCS",
    rows: blankRows(12),
  },
  {
    id: "bus-3",
    name: "BSIT 3D and BSIS",
    rows: blankRows(12),
  },
];
