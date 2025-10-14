import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RoutePoint {
  easting: string;
  northing: string;
}

interface SensitiveAreaCheckMapProps {
  points: RoutePoint[];
  selectedIdx: number | null;
  setPoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSelectedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  routeName?: string;
}

const SensitiveAreaCheckMap: React.FC<SensitiveAreaCheckMapProps> = ({ points, selectedIdx, setPoints, setSelectedIdx, routeName }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  function osgbToLatLng(easting: number, northing: number): [number, number] {
    const lat = 49.5 + (northing - 50000) / 111000;
    const lng = -7.5 + (easting - 50000) / 70000;
    return [lat, lng];
  }

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current).setView([54.5, -3.5], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstance.current = map;
      map.on('click', function (e: L.LeafletMouseEvent) {
        if (selectedIdx !== null) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          const northing = Math.round((lat - 49.5) * 111000 + 50000);
          const easting = Math.round((lng + 7.5) * 70000 + 50000);
          setPoints(prev => prev.map((pt, i) => i === selectedIdx ? { easting: String(easting), northing: String(northing) } : pt));
        }
      });
    }
  }, [selectedIdx, setPoints]);

  useEffect(() => {
    const map = mapInstance.current;
    if (map) {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
      if (markersRef.current.length) {
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];
      }
      function isValidNumber(val: string) {
        const num = Number(val);
        return val !== '' && !isNaN(num) && isFinite(num) && num > 10000;
      }
      const validPoints = points.filter(pt => isValidNumber(pt.easting) && isValidNumber(pt.northing));
      // Only use latlngs if all are valid arrays of two finite numbers
      const latlngs = validPoints
        .map(pt => osgbToLatLng(Number(pt.easting), Number(pt.northing)))
        .filter(arr => Array.isArray(arr) && arr.length === 2 && arr.every(v => typeof v === 'number' && isFinite(v)));

      // Defensive: do not draw polyline or bounds if any latlng is undefined or not finite
      const safeLatLngs = latlngs.filter(([lat, lng]) => isFinite(lat) && isFinite(lng));

      // Show routeName as marker label for each valid point (no background, not all caps, GOV.UK style)
      const markerLabel = routeName || 'Route';
      markersRef.current = latlngs.map((latlng) => {
          const marker = L.marker(latlng, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<span class="govuk-body govuk-!-font-weight-bold" style="color: #0b0c0c; font-size: 18px; line-height: 1.1; padding: 0; border: none; background: none; box-shadow: none; white-space: nowrap; text-shadow: 2px 2px 4px #fff, 0 0 2px #fff;">${markerLabel}</span>`,
              iconSize: undefined,
              iconAnchor: [24, 32],
            })
          }).addTo(map);
          return marker;
        });

      // Add a small, single-line label to the middle of the route if there are at least 2 points
      let routeLabelMarker: L.Marker | null = null;
      if (latlngs.length >= 2) {
        const midIdx = Math.floor(latlngs.length / 2);
        const midLatLng = latlngs.length % 2 === 0
          ? [
              (latlngs[midIdx - 1][0] + latlngs[midIdx][0]) / 2,
              (latlngs[midIdx - 1][1] + latlngs[midIdx][1]) / 2
            ]
          : latlngs[midIdx];
        routeLabelMarker = L.marker(midLatLng as [number, number], {
          interactive: false,
          icon: L.divIcon({
            className: 'route-label',
            html: `<span class="govuk-body" style="text-shadow: 2px 2px 4px #fff, 0 0 2px #fff;">${routeName || 'Route'}</span>`,
            iconSize: undefined,
            iconAnchor: [50, 12],
          })
        }).addTo(map);
        markersRef.current.push(routeLabelMarker);
      }

      // Draw the route polyline if there are at least 2 valid points
      if (safeLatLngs.length >= 2) {
        try {
          polylineRef.current = L.polyline(safeLatLngs, {
            color: 'yellow', // Use a more visible color
            weight: 6,    // Make the line thicker
            opacity: 0.9,
            pane: 'overlayPane' // Ensure polyline is above markers
          }).addTo(map);
          const bounds = L.latLngBounds(safeLatLngs);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
          }
        } catch {
          // Silently ignore fitBounds errors
        }
        // Zoom to the most recently selected/updated point if available
        if (typeof selectedIdx === 'number' && safeLatLngs[selectedIdx]) {
          map.setView(safeLatLngs[selectedIdx], 15);
        } else if (safeLatLngs.length > 0) {
          map.setView(safeLatLngs[safeLatLngs.length - 1], 15);
        }
      } else if (safeLatLngs.length === 1) {
        map.setView(safeLatLngs[0], 15);
      } else {
        // Default zoom out for empty/invalid
        map.setView([54.5, -3.5], 6);
      }
    }
  }, [points]);

  return <div style={{ height: 500, width: '100%' }} ref={mapRef} id="map" />;
};

export default SensitiveAreaCheckMap;