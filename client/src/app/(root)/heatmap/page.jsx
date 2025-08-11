"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Load Leaflet map only on client
const Map = dynamic(() => import("@/components/newsfeed/HeatmapMap"), { ssr: false });

export default function HeatmapPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/posts?limit=1")
      .then((r) => r.json())
      .then((d) => setData(d.heatmap || []))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crime Heatmap</h1>
      <Map data={data} />
    </div>
  );
}


