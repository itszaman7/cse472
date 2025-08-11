"use client";

import { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

const OpenStreetMapViewer = ({ location, className = "h-64 w-full rounded-lg" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    const loadMap = async () => {
      if (typeof window === 'undefined') return;

      try {
        setIsLoading(true);
        setError(null);

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchjw9VqVk6vSd2/2E9uK4ms4guTSzMKIoTQ8Q=';
          script.crossOrigin = '';
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Leaflet script'));
            document.head.appendChild(script);
          });
        }

        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize map
        if (mapRef.current && !mapInstanceRef.current && window.L) {
          const L = window.L;
          
          // Default to Dhaka coordinates if no location
          const defaultLat = 23.8103;
          const defaultLng = 90.4125;
          
          mapInstanceRef.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 10);
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(mapInstanceRef.current);

          // Force a resize to ensure proper rendering
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        setError('Failed to load map. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !location || !window.L) return;

    const updateMarker = async () => {
      try {
        // Geocode the location using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=bd&limit=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CrimeShield/1.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);

            const L = window.L;
            
            // Remove existing marker
            if (markerRef.current) {
              mapInstanceRef.current.removeLayer(markerRef.current);
            }

            // Add new marker
            markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
            
            // Add popup with location name
            markerRef.current.bindPopup(result.display_name || location).openPopup();
            
            // Fit map to marker
            mapInstanceRef.current.setView([lat, lng], 15);
          }
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
      }
    };

    updateMarker();
  }, [location]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm font-medium">Map Loading Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      {!location && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Select a location to view on map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapViewer; 