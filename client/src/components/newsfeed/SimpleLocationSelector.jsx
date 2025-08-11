"use client";

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const cities = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Mymensingh',
  'Comilla',
  'Narayanganj',
  'Gazipur',
  'Tangail',
  'Bogra',
  'Kushtia',
  'Jessore',
  'Pabna',
  'Dinajpur',
  'Noakhali',
  'Feni',
  'Cox\'s Bazar'
];

const SimpleLocationSelector = ({ selectedLocation, onLocationChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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
              <span className="text-sm">{selectedLocation || 'Select Location'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
          {cities.map((city) => (
            <DropdownMenuItem
              key={city}
              onClick={() => {
                onLocationChange(city);
                setIsOpen(false);
              }}
              className="cursor-pointer hover:bg-gray-100"
            >
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {city}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SimpleLocationSelector; 