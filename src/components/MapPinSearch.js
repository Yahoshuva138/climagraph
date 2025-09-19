import React, { useEffect, useRef, useState } from "react";

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
  const [mapError, setMapError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      const msg = "Google Maps API key not set (REACT_APP_GOOGLE_MAPS_API_KEY). Map unavailable.";
      console.warn(msg);
      setMapError(msg);
      setLoading(false);
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
      .then(() => setLoading(false))
      .catch((err) => {
        const msg = "Failed to load Google Maps script.";
        console.error(msg, err);
        setMapError(msg + (err && err.message ? ` ${err.message}` : ""));
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [onSelect]);

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Pin a Place on the Map</h3>
      {mapError ? (
        <div className="w-full max-w-xl h-80 rounded-lg shadow-sm flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-4">
          <div>
            <p className="font-medium">Map unavailable</p>
            <p className="text-sm mt-1">{mapError}</p>
            <p className="text-xs mt-2 text-gray-500">If you deployed to Vercel, add your Google Maps API key to the project env as REACT_APP_GOOGLE_MAPS_API_KEY and rebuild.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="w-full max-w-xl h-80 rounded-lg shadow-sm" />
          {loading && <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Loading map…</p>}
          {!loading && <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Click the map to place a pin. The pinned place name will be returned.</p>}
        </>
      )}
    </div>
  );
};

export default MapPinSearch;
