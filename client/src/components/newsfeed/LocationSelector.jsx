"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

const LocationSelector = ({ onLocationSelect, initialLocation = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Load Google Maps API using global loader
  useEffect(() => {
    const initializeMaps = async () => {
      try {
        await loadGoogleMaps();
        setMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initializeMaps();
  }, []);

  // Search for location suggestions
  const searchLocations = async (query) => {
    if (!query.trim() || !mapsLoaded || !window.google) return;

    setIsLoading(true);
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'us' } // Restrict to US for now
      };

      service.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions || []);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (suggestion) => {
    if (!mapsLoaded || !window.google) return;

    setSelectedLocation(suggestion.description);
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    
    // Get coordinates for the selected location
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        setCoordinates({
          lat: location.lat(),
          lng: location.lng()
        });
        onLocationSelect({
          address: suggestion.description,
          coordinates: {
            lat: location.lat(),
            lng: location.lng()
          }
        });
      }
    });
  };

  // Handle manual location input
  const handleManualLocation = () => {
    if (searchQuery.trim()) {
      setSelectedLocation(searchQuery);
      onLocationSelect({
        address: searchQuery,
        coordinates: coordinates
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!mapsLoaded || !window.google) return;

    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          
          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation(address);
              setSearchQuery(address);
              onLocationSelect({
                address: address,
                coordinates: { lat: latitude, lng: longitude }
              });
            }
            setIsLoading(false);
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  // Clear location
  const clearLocation = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setCoordinates(null);
    setSuggestions([]);
    onLocationSelect(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Location Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
              disabled={!mapsLoaded}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLocation}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Current Location Button */}
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoading || !mapsLoaded}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoading ? 'Getting location...' : 'Use Current Location'}
          </Button>

          {/* Loading indicator */}
          {!mapsLoaded && (
            <div className="text-sm text-gray-500 text-center py-2">
              Loading location services...
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                  <div className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">{selectedLocation}</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Selected
                </Badge>
              </div>
              {coordinates && (
                <div className="text-sm text-green-600 mt-1">
                  Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
          )}

          {/* Manual Location Button */}
          {searchQuery && !selectedLocation && mapsLoaded && (
            <Button
              onClick={handleManualLocation}
              className="w-full"
            >
              Use "{searchQuery}" as location
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Map Preview (Optional) */}
      {showMap && coordinates && (
        <Card>
          <CardHeader>
            <CardTitle>Map Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              id="map" 
              className="w-full h-64 rounded-lg border"
              style={{ backgroundColor: '#f0f0f0' }}
            >
              {/* Map will be rendered here */}
              <div className="flex items-center justify-center h-full text-gray-500">
                Map loading...
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSelector; 