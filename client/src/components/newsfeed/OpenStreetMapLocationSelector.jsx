"use client";

import { useState, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const OpenStreetMapLocationSelector = ({ selectedLocation, onLocationChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Search for locations using OpenStreetMap's Nominatim API
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=10&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CrimeShield/1.0' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
      setError('Failed to search locations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    const displayName = location.display_name || location.name || 'Unknown Location';
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    onLocationChange({ label: displayName, latitude: lat, longitude: lon });
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const formatLocationName = (location) => {
    if (location.display_name) {
      // Extract the most relevant part of the address
      const parts = location.display_name.split(', ');
      return parts.slice(0, 2).join(', '); // Show first two parts
    }
    return location.name || 'Unknown Location';
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-300 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">{selectedLocation || 'Search for location...'}</span>
            </div>
            <Search className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
                autoFocus
              />
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm p-2">
                {error}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-2">
                {searchResults.map((location, index) => (
                  <DropdownMenuItem
                    key={`${location.place_id}-${index}`}
                    onClick={() => handleLocationSelect(location)}
                    className="cursor-pointer hover:bg-gray-100 p-2"
                  >
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {formatLocationName(location)}
                        </div>
                        {location.address && (
                          <div className="text-xs text-gray-500 truncate">
                            {location.address.city || location.address.town || location.address.village || ''}
                            {location.address.state && `, ${location.address.state}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            {searchQuery && !isLoading && searchResults.length === 0 && !error && (
              <div className="text-gray-500 text-sm p-2 text-center">
                No locations found. Try a different search term.
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OpenStreetMapLocationSelector; 