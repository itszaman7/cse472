"use client";

import { useEffect, useRef } from "react";

// Enhanced heatmap with interesting visualizations

export default function HeatmapMap({ data }) {
  const ref = useRef(null);
  
  console.log('HeatmapMap: Received data:', data);
  console.log('HeatmapMap: Data length:', data?.length || 0);

  useEffect(() => {
    let map;
    let leaflet;
    let markerClusterGroup;
    
    const setup = async () => {
      if (!ref.current) return;
      
      // Clean up any existing map
      if (ref.current._leaflet_id) {
        console.log('HeatmapMap: Cleaning up existing map');
        return; // Don't reinitialize if map already exists
      }
      
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
      
      // Load MarkerCluster plugin
      if (!window.L.markerClusterGroup) {
        await new Promise((resolve) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
          document.head.appendChild(link);
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
          script.async = true;
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      
      leaflet = window.L;
      console.log('HeatmapMap: Leaflet loaded:', !!leaflet);
      
      map = leaflet.map(ref.current).setView([23.8103, 90.4125], 11);
      console.log('HeatmapMap: Map created:', !!map);
      
      // Use a more interesting tile layer
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      console.log('HeatmapMap: Tile layer added');

      // Process data points
      console.log('HeatmapMap: Processing data points...');
      const points = [];
      
      if (data && Array.isArray(data)) {
        data.forEach((row, index) => {
          console.log(`HeatmapMap: Processing row ${index}:`, row);
          
          const k = row._id;
          let lat, lng;
          
          // Handle different data types
          if (k && typeof k === 'object' && k.lat && k.lng) {
            // Direct coordinates object
            lat = k.lat;
            lng = k.lng;
            console.log(`HeatmapMap: Using direct coordinates: ${lat}, ${lng}`);
          } else if (k && typeof k === 'string') {
            // String location - handle special cases
            if (k === '[object Object]') {
              console.log(`HeatmapMap: Skipping [object Object] entry`);
              return; // Skip this invalid entry
            }
            
            // Fix common typos
            let locationName = k;
            if (k === 'Mirput') locationName = 'Mirpur';
            
            const coords = getSimpleCoordinates(locationName);
            lat = coords.lat;
            lng = coords.lng;
            console.log(`HeatmapMap: Using mapped coordinates for "${locationName}": ${lat}, ${lng}`);
          } else {
            console.log(`HeatmapMap: Skipping invalid row:`, row);
            return;
          }
          
          points.push({ lat, lng, count: row.count, location: k });
          console.log(`HeatmapMap: Added point: ${lat}, ${lng}, count: ${row.count}`);
        });
      }
      
      console.log('HeatmapMap: Final points array:', points);
      
      // Create marker cluster group
      markerClusterGroup = leaflet.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size, className;
          
          if (count > 10) {
            size = 'large';
            className = 'marker-cluster-large';
          } else if (count > 5) {
            size = 'medium';
            className = 'marker-cluster-medium';
          } else {
            size = 'small';
            className = 'marker-cluster-small';
          }
          
          return leaflet.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster ${className}`,
            iconSize: leaflet.point(40, 40)
          });
        }
      });
      
      // Add enhanced markers to map
      if (points.length > 0) {
        console.log('HeatmapMap: Adding enhanced markers to map...');
        points.forEach((pt) => {
          try {
            // Create enhanced marker with custom styling
            const marker = createEnhancedMarker(leaflet, pt);
            markerClusterGroup.addLayer(marker);
            console.log(`HeatmapMap: Added enhanced marker at ${pt.lat}, ${pt.lng} with count ${pt.count}`);
          } catch (e) {
            console.log('HeatmapMap: Error creating marker for point:', pt, e);
          }
        });
        
        map.addLayer(markerClusterGroup);
      } else {
        console.log('HeatmapMap: No points to display');
      }
      
      // Add custom CSS for enhanced styling
      addCustomStyles();
    };
    
    // Create enhanced marker with interesting visual effects
    function createEnhancedMarker(leaflet, point) {
      const { lat, lng, count, location } = point;
      
      // Calculate dynamic properties based on crime count
      const radius = Math.max(12, Math.min(35, count * 6));
      const pulseRadius = radius * 1.5;
      
      // Create gradient color based on crime count
      const color = getCrimeColor(count);
      const pulseColor = getPulseColor(count);
      
      // Create custom icon with HTML
      const icon = leaflet.divIcon({
        html: `
          <div class="crime-marker" style="
            width: ${radius * 2}px;
            height: ${radius * 2}px;
            background: radial-gradient(circle, ${color} 0%, ${color}dd 70%, ${color}88 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 3px ${pulseColor}, 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
            animation: pulse 2s infinite;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-weight: bold;
              font-size: ${Math.max(10, Math.min(16, count * 2))}px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            ">${count}</div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius]
      });
      
      const marker = leaflet.marker([lat, lng], { icon });
      
      // Create enhanced popup
      const popupContent = createEnhancedPopup(point);
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'crime-popup'
      });
      
             // Add hover effects
       marker.on('mouseover', function() {
         const element = this.getElement();
         if (element) {
           const crimeMarker = element.querySelector('.crime-marker');
           if (crimeMarker) {
             crimeMarker.style.transform = 'scale(1.1)';
             crimeMarker.style.boxShadow = '0 0 0 5px rgba(220, 38, 38, 0.3), 0 8px 16px rgba(0,0,0,0.4)';
           }
           element.style.zIndex = '1000';
         }
       });
       
       marker.on('mouseout', function() {
         const element = this.getElement();
         if (element) {
           const crimeMarker = element.querySelector('.crime-marker');
           if (crimeMarker) {
             crimeMarker.style.transform = 'scale(1)';
             crimeMarker.style.boxShadow = '';
           }
           element.style.zIndex = 'auto';
         }
       });
      
      return marker;
    }
    
    // Create enhanced popup content
    function createEnhancedPopup(point) {
      const { count, location } = point;
      const severity = count > 5 ? 'High' : count > 2 ? 'Medium' : 'Low';
      const severityColor = count > 5 ? '#dc2626' : count > 2 ? '#f59e0b' : '#10b981';
      
      return `
        <div class="crime-popup-content">
          <div class="popup-header" style="
            background: linear-gradient(135deg, ${severityColor}, ${severityColor}dd);
            color: white;
            padding: 12px;
            margin: -12px -12px 12px -12px;
            border-radius: 8px 8px 0 0;
            font-weight: bold;
            font-size: 16px;
          ">
            🚨 Crime Alert
          </div>
          <div style="padding: 8px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #374151;">Location:</span>
              <span style="margin-left: 8px; color: #6b7280;">${typeof location === 'string' ? location : 'Unknown'}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #374151;">Incidents:</span>
              <span style="
                margin-left: 8px;
                background: ${severityColor};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 14px;
              ">${count}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="font-weight: bold; color: #374151;">Severity:</span>
              <span style="
                margin-left: 8px;
                color: ${severityColor};
                font-weight: bold;
              ">${severity}</span>
            </div>
          </div>
          <div style="
            margin-top: 12px;
            padding: 8px;
            background: #f3f4f6;
            border-radius: 6px;
            font-size: 12px;
            color: #6b7280;
          ">
            📍 Click to view details and report new incidents
          </div>
        </div>
      `;
    }
    
    // Get crime color based on count
    function getCrimeColor(count) {
      if (count >= 5) return '#dc2626'; // Red
      if (count >= 3) return '#f59e0b'; // Orange
      if (count >= 2) return '#eab308'; // Yellow
      return '#10b981'; // Green
    }
    
    // Get pulse color based on count
    function getPulseColor(count) {
      if (count >= 5) return '#dc2626'; // Red
      if (count >= 3) return '#f59e0b'; // Orange
      if (count >= 2) return '#eab308'; // Yellow
      return '#10b981'; // Green
    }
    
    // Add custom CSS styles
    function addCustomStyles() {
      const style = document.createElement('style');
      style.textContent = `
                 .crime-marker {
           transition: all 0.3s ease;
           transform-origin: center center;
         }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.2), 0 4px 8px rgba(0,0,0,0.3);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0,0,0,0.3);
          }
        }
        
        .crime-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        
        .crime-popup .leaflet-popup-tip {
          background: white;
        }
        
        .marker-cluster {
          background: radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.6) 100%);
          border: 3px solid white;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          text-align: center;
          line-height: 40px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .marker-cluster-large {
          background: radial-gradient(circle, rgba(220, 38, 38, 0.9) 0%, rgba(220, 38, 38, 0.7) 100%);
        }
        
        .marker-cluster-medium {
          background: radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, rgba(245, 158, 11, 0.6) 100%);
        }
        
        .marker-cluster-small {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.6) 100%);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Simple coordinate mapping function
    function getSimpleCoordinates(location) {
      const locationMap = {
        'Bangladesh': { lat: 23.6850, lng: 90.3563 },
        'Dhaka': { lat: 23.8103, lng: 90.4125 },
        'Mirpur': { lat: 23.8103, lng: 90.3654 },
        'Mohammadpur': { lat: 23.7639, lng: 90.3589 },
        'Mirpur 10': { lat: 23.8103, lng: 90.3654 },
        'Mirpur 6': { lat: 23.8103, lng: 90.3654 },
        'Chittagong': { lat: 22.3419, lng: 91.8132 },
        'Sylhet': { lat: 24.8949, lng: 91.8687 },
        'Rajshahi': { lat: 24.3745, lng: 88.6042 },
        'Khulna': { lat: 22.8456, lng: 89.5403 },
        'Barisal': { lat: 22.7010, lng: 90.3535 },
        'Rangpur': { lat: 25.7439, lng: 89.2752 },
        'Mymensingh': { lat: 24.7471, lng: 90.4203 },
        'Comilla': { lat: 23.4607, lng: 91.1809 },
        'Narayanganj': { lat: 23.6237, lng: 90.5000 },
        'Gazipur': { lat: 23.9999, lng: 90.4203 },
        'Tangail': { lat: 24.2513, lng: 89.9167 },
        'Bogra': { lat: 24.8510, lng: 89.3697 },
        'Kushtia': { lat: 23.9011, lng: 89.1222 },
        'Jessore': { lat: 23.1707, lng: 89.2097 },
        'Pabna': { lat: 24.0023, lng: 89.2374 },
        'Dinajpur': { lat: 25.6279, lng: 88.6333 },
        'Faridpur': { lat: 23.6061, lng: 89.8406 },
        'Noakhali': { lat: 22.8333, lng: 91.1000 },
        'Feni': { lat: 23.0159, lng: 91.3976 },
        'Lakshmipur': { lat: 22.9443, lng: 90.8295 },
        'Chandpur': { lat: 23.2333, lng: 90.6500 },
        'Brahmanbaria': { lat: 23.9667, lng: 91.1000 },
        'Habiganj': { lat: 24.3833, lng: 91.4167 },
        'Sunamganj': { lat: 25.0667, lng: 91.4000 },
        'Moulvibazar': { lat: 24.4833, lng: 91.7833 },
        'Netrokona': { lat: 24.8833, lng: 90.7333 },
        'Kishoreganj': { lat: 24.4333, lng: 90.7833 },
        'Narsingdi': { lat: 23.9167, lng: 90.7167 },
        'Munshiganj': { lat: 23.5500, lng: 90.5333 },
        'Shariatpur': { lat: 23.2000, lng: 90.3500 },
        'Madaripur': { lat: 23.1667, lng: 90.2000 },
        'Gopalganj': { lat: 23.0167, lng: 90.1333 },
        'Jhenaidah': { lat: 23.5333, lng: 89.1667 },
        'Magura': { lat: 23.4833, lng: 89.4167 },
        'Meherpur': { lat: 23.7667, lng: 88.6333 },
        'Natore': { lat: 24.4167, lng: 88.9833 },
        'Naogaon': { lat: 24.8000, lng: 88.9333 },
        'Joypurhat': { lat: 25.1000, lng: 89.0167 },
        'Panchagarh': { lat: 26.3333, lng: 88.5667 },
        'Thakurgaon': { lat: 26.0333, lng: 88.4667 },
        'Nilphamari': { lat: 25.9333, lng: 88.8500 },
        'Lalmonirhat': { lat: 25.9167, lng: 89.4500 },
        'Kurigram': { lat: 25.8000, lng: 89.6500 },
        'Gaibandha': { lat: 25.3333, lng: 89.5333 },
        'Jamalpur': { lat: 24.9167, lng: 89.9333 },
        'Sherpur': { lat: 25.0167, lng: 90.0167 },
        'Cox\'s Bazar': { lat: 21.4333, lng: 91.9833 },
        'Bandarban': { lat: 22.2000, lng: 92.2167 },
        'Rangamati': { lat: 22.6333, lng: 92.2000 },
        'Khagrachari': { lat: 23.1167, lng: 91.9667 }
      };
      
      // Check for exact matches first
      if (locationMap[location]) {
        return locationMap[location];
      }
      
      // Check for partial matches
      for (const [key, coords] of Object.entries(locationMap)) {
        if (location.toLowerCase().includes(key.toLowerCase())) {
          return coords;
        }
      }
      
      // Default to Dhaka coordinates for unknown locations
      return { lat: 23.8103, lng: 90.4125 };
    }
    
    setup();
    return () => {
      if (map) map.remove();
    };
  }, [data]);

  return (
    <div>
      <div ref={ref} className="w-full h-[70vh] rounded-lg border shadow-lg" />
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Crime Heatmap Legend</h3>
          <span className="text-sm text-gray-600">Data points: {data?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Low (1-2 incidents)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Medium (3-4 incidents)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>High (5+ incidents)</span>
          </div>
        </div>
      </div>
    </div>
  );
}


