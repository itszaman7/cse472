"use client";

import { useEffect, useRef } from "react";

// Renders a heatmap using heatmap.js overlayed on a Leaflet base map

export default function HeatmapMap({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    let map;
    let leaflet;
    let heatmapLayer;
    let heatmapInstance;
    const setup = async () => {
      if (!ref.current) return;
      // Load Leaflet from CDN
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      leaflet = window.L;
      map = leaflet.map(ref.current).setView([23.8103, 90.4125], 11);
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Load heatmap.js + Leaflet plugin
      const ensureScript = (src) => new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });

      const haveCore = window.h337 || await ensureScript('https://unpkg.com/heatmapjs@2.0.2/heatmap.min.js');
      const havePlugin = window.HeatmapOverlay || await ensureScript('https://unpkg.com/heatmap.js@2.0.2/plugins/leaflet-heatmap/leaflet-heatmap.min.js');

      const points = [];
      let max = 1;
      (data || []).forEach((row) => {
        const k = row._id;
        if (k && typeof k === 'object' && (k.lat || k.latitude) && (k.lng || k.longitude)) {
          const lat = k.lat ?? k.latitude;
          const lng = k.lng ?? k.longitude;
          points.push({ lat, lng, count: row.count });
          if (row.count > max) max = row.count;
        }
      });

      if (haveCore && havePlugin && points.length > 0) {
        const cfg = {
          radius: 25,
          maxOpacity: 0.6,
          scaleRadius: true,
          useLocalExtrema: false,
          latField: 'lat',
          lngField: 'lng',
          valueField: 'count'
        };
        heatmapLayer = new window.HeatmapOverlay(cfg);
        heatmapLayer.addTo(map);
        heatmapLayer.setData({ max, data: points });
      } else if (haveCore) {
        // Fallback: overlay heatmap canvas aligned with map container
        const container = ref.current;
        const heatContainer = document.createElement('div');
        heatContainer.style.position = 'absolute';
        heatContainer.style.top = '0';
        heatContainer.style.left = '0';
        heatContainer.style.width = '100%';
        heatContainer.style.height = '100%';
        container.appendChild(heatContainer);

        heatmapInstance = window.h337.create({
          container: heatContainer,
          radius: 30,
          maxOpacity: 0.6,
          minOpacity: 0.1,
          blur: 0.85,
        });

        const recalc = () => {
          const pxPoints = [];
          let m = 1;
          points.forEach((pt) => {
            const p = map.latLngToContainerPoint([pt.lat, pt.lng]);
            pxPoints.push({ x: Math.round(p.x), y: Math.round(p.y), value: pt.count });
            if (pt.count > m) m = pt.count;
          });
          heatmapInstance.setData({ max: m, data: pxPoints });
        };
        map.on('moveend zoomend resize', recalc);
        recalc();
      }
    };
    setup();
    return () => {
      if (map) map.remove();
    };
  }, [data]);

  return <div ref={ref} className="w-full h-[70vh] rounded-lg border" />;
}


