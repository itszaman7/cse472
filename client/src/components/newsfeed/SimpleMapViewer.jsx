"use client";

import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Globe } from 'lucide-react';

const SimpleMapViewer = ({ location, className = "h-64 w-full rounded-lg" }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) {
      setCoordinates(null);
      return;
    }

    // If we already have coordinates from selector, use them directly
    if (typeof location === 'object' && location.latitude && location.longitude) {
      setCoordinates({
        lat: Number(location.latitude),
        lng: Number(location.longitude),
        displayName: location.label || 'Selected location'
      });
      return;
    }

    const geocodeLocation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(String(location))}&countrycodes=bd&limit=1`,
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
            setCoordinates({
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              displayName: result.display_name || String(location)
            });
          } else {
            setError('Location not found');
          }
        } else {
          setError('Failed to geocode location');
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
        setError('Failed to load location data');
      } finally {
        setIsLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm font-medium">Location Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Select a location to view details</p>
        </div>
      </div>
    );
  }

  if (coordinates) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-600">{coordinates.displayName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Latitude</p>
                  <p className="text-sm text-gray-600">{coordinates.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Longitude</p>
                  <p className="text-sm text-gray-600">{coordinates.lng.toFixed(6)}</p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View on OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
      <div className="text-center text-gray-500">
        <MapPin className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Location not found</p>
      </div>
    </div>
  );
};

export default SimpleMapViewer; 