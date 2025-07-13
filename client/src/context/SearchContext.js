"use client";

import { createContext, useContext, useState } from 'react';

// 1. Create the context with a default value
const SearchContext = createContext({
  searchQuery: '',
  setSearchQuery: () => {},
});

// 2. Create a "Provider" component
export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const value = { searchQuery, setSearchQuery };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// 3. Create a custom hook for easy access
export function useSearch() {
  return useContext(SearchContext);
}