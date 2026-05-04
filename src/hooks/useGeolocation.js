import { useState, useCallback } from "react";
import { RESTAURANT_LOCATION } from "../utils/menuItems";

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by this browser.");
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = getDistanceInMeters(
            latitude,
            longitude,
            RESTAURANT_LOCATION.latitude,
            RESTAURANT_LOCATION.longitude
          );

          setLoading(false);

          if (distance <= RESTAURANT_LOCATION.radiusInMeters) {
            resolve({ inRange: true, distance: Math.round(distance) });
          } else {
            resolve({ inRange: false, distance: Math.round(distance) });
          }
        },
        (err) => {
          setLoading(false);
          setError(err.message);
          reject(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { checkLocation, loading, error };
}
