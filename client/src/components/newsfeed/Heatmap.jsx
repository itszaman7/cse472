"use client";

import { useEffect, useState } from "react";

// Shows list for now; when coordinates are present, a map page will render a heat layer
export default function Heatmap({ data }) {
  const [top, setTop] = useState([]);

  useEffect(() => {
    if (!Array.isArray(data)) return;
    setTop(data.slice(0, 10));
  }, [data]);

  if (!data || data.length === 0) return null;

  const toLabel = (k) => {
    if (!k) return 'Unknown';
    if (typeof k === 'string') return k;
    if (typeof k === 'object' && k.lat && k.lng) return `${k.lat.toFixed(4)}, ${k.lng.toFixed(4)}`;
    return String(k);
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="text-sm font-semibold mb-2">Hot Locations</h3>
      <ul className="space-y-1 text-sm text-gray-700">
        {top.map((row, idx) => (
          <li key={idx} className="flex justify-between">
            <span className="truncate mr-2">{toLabel(row._id)}</span>
            <span className="font-medium">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


