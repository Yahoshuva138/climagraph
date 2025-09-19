import React, { useEffect, useRef } from "react";

const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const MapPinSearch = ({ onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("REACT_APP_GOOGLE_MAPS_API_KEY not set. Map will not load.");
      return;
    }

    let isMounted = true;
    loadGoogleMapsScript(apiKey)
      .then((maps) => {
        if (!isMounted) return;
        mapInstance.current = new maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // India center
          zoom: 5,
        });

        // Click to place marker
        mapInstance.current.addListener("click", (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = new maps.Marker({ position: { lat, lng }, map: mapInstance.current });

          // Reverse geocode to get place name (prefer locality/administrative)
          const geocoder = new maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            let city = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            if (results && results.length > 0) {
              const first = results.find((r) => r.types && (r.types.includes("locality") || r.types.includes("administrative_area_level_1") || r.types.includes("administrative_area_level_2"))) || results[0];
              if (first && first.formatted_address) city = first.formatted_address;
            }
            onSelect({ lat, lng, city });
          });
        });
      })
      .catch((err) => {
        console.error("Failed to load Google Maps", err);
      });

    return () => {
      isMounted = false;
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [onSelect]);

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Pin a Place on the Map</h3>
      <div ref={mapRef} className="w-full max-w-xl h-80 rounded-lg shadow-sm" />
      <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Click the map to place a pin. The pinned place name will be returned.</p>
    </div>
  );
};

export default MapPinSearch;
