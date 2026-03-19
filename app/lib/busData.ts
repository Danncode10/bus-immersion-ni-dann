import { BusRow } from "../components/BusSeatingChart";

export interface BusConfig {
  id: string;
  name: string;
  rows: BusRow[];
}

/** Generate n blank rows with auto-incrementing seat numbers.
 *  The very last row also gets a back-centre (middle/aisle) seat.
 */
function blankRows(totalRows: number): BusRow[] {
  return Array.from({ length: totalRows }, (_, i) => {
    const base = i * 4;
    const isLastRow = i === totalRows - 1;
    return {
      leftWindow:  { seatNumber: base + 1, status: "vacant" },
      leftAisle:   { seatNumber: base + 2, status: "vacant" },
      ...(isLastRow
        ? { middleSeat: { seatNumber: base + 3, status: "vacant" } }
        : {}),
      rightAisle:  { seatNumber: isLastRow ? base + 4 : base + 3, status: "vacant" },
      rightWindow: { seatNumber: isLastRow ? base + 5 : base + 4, status: "vacant" },
    } as BusRow;
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
