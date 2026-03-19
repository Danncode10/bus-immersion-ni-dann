import BusSeatingChart, { BusRow } from "./components/BusSeatingChart";

// Generate blank rows – seat numbers auto-assigned, passengers all vacant
function generateBlankRows(totalRows: number): BusRow[] {
  const rows: BusRow[] = [];

  for (let i = 0; i < totalRows; i++) {
    // Each row has 4 seat positions; seat numbers go left-to-right, top-to-bottom
    const base = i * 4;
    rows.push({
      leftWindow: { seatNumber: base + 1 },
      leftAisle: { seatNumber: base + 2 },
      rightAisle: { seatNumber: base + 3 },
      rightWindow: { seatNumber: base + 4 },
    });
  }

  return rows;
}

export default function Home() {
  const rows = generateBlankRows(12);

  return (
    <BusSeatingChart busName="BSIT 3B and BSCS" rows={rows} />
  );
}
