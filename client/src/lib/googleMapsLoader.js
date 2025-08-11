// Global Google Maps API loader
let googleMapsLoaded = false;
let googleMapsLoading = false;
let googleMapsCallbacks = [];

export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // If already loading, add to callbacks
    if (googleMapsLoading) {
      googleMapsCallbacks.push({ resolve, reject });
      return;
    }

    // Start loading
    googleMapsLoading = true;
    googleMapsCallbacks.push({ resolve, reject });

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      // Resolve all pending callbacks
      googleMapsCallbacks.forEach(({ resolve }) => resolve());
      googleMapsCallbacks = [];
    };
    
    script.onerror = () => {
      googleMapsLoading = false;
      // Reject all pending callbacks
      googleMapsCallbacks.forEach(({ reject }) => reject(new Error('Failed to load Google Maps API')));
      googleMapsCallbacks = [];
    };
    
    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = () => {
  return googleMapsLoaded || (window.google && window.google.maps);
}; 