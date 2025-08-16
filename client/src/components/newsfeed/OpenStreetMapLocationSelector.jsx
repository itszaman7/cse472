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
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&countrycodes=bd&limit=10&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CrimeShield/1.0' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
      setError(`Failed to search locations: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 3) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    try {
      const displayName = location.display_name || location.name || 'Unknown Location';
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates:', location);
        setError('Invalid location coordinates');
        return;
      }
      
      onLocationChange({ label: displayName, latitude: lat, longitude: lon });
      setSearchQuery('');
      setSearchResults([]);
      setIsOpen(false);
      setError('');
    } catch (error) {
      console.error('Error selecting location:', error);
      setError('Failed to select location');
    }
  };

  const formatLocationName = (location) => {
    if (location.display_name) {
      // Extract the most relevant part of the address
      const parts = location.display_name.split(', ');
      // Show first two parts, but limit total length
      const shortName = parts.slice(0, 2).join(', ');
      if (shortName.length <= 50) {
        return shortName;
      }
      // If still too long, show just the first part
      return parts[0] || 'Unknown Location';
    }
    return location.name || 'Unknown Location';
  };

  // Create a shorter display name for the button
  const getShortLocationName = (location) => {
    if (!location) return 'Search for location...';
    
    if (location.length <= 40) {
      return location;
    }
    
    // If it's a long location name, show first part + "..."
    const parts = location.split(', ');
    if (parts.length > 1) {
      return `${parts[0]}, ${parts[1]}...`;
    }
    return location.substring(0, 37) + '...';
  };

    return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-300 hover:bg-gray-50 min-h-[40px]"
            title={selectedLocation && selectedLocation.length > 30 ? selectedLocation : undefined}
          >
            <div className="flex items-center flex-1 min-w-0">
              <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-sm truncate text-left">
                {getShortLocationName(selectedLocation)}
              </span>
            </div>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-full max-w-[320px] max-h-60 overflow-y-auto" align="start" side="bottom" sideOffset={4}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
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
                     <div className="flex items-start w-full">
                       <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-medium text-gray-900 truncate leading-tight">
                           {formatLocationName(location)}
                         </div>
                         {location.address && (
                           <div className="text-xs text-gray-500 truncate leading-tight mt-0.5">
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