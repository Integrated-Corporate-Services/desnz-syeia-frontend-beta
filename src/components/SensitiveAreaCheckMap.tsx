import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RoutePoint {
  easting: string;
  northing: string;
  pointId?: string;
}

interface SensitiveAreaCheckMapProps {
  points: RoutePoint[];
  selectedIdx: number | null;
  setPoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSelectedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  routeName?: string;
  routeId?: string;
  mode?: 'overview' | 'edit'; // overview: project overview, edit: route map
}

const SensitiveAreaCheckMap: React.FC<SensitiveAreaCheckMapProps> = ({ points, selectedIdx, setPoints, setSelectedIdx, routeName, mode = 'overview' }) => {
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


      // Markers and labels
      markersRef.current = [];
      if (mode === 'edit') {
        // Show the number of each point at its location, matching the user's input points
        latlngs.forEach((latlng, i) => {
          const marker = L.marker(latlng, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<span style="font-size: 15px; color: #111; background: none; border: none; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 1px 0 #fff, 1px 0px 0 #fff, 0px -1px 0 #fff, -1px 0px 0 #fff;">${i + 1}</span>`
            })
          }).addTo(map);
          markersRef.current.push(marker);
        });
      }
      if (mode === 'overview') {
        // Only X marker at the end
        if (latlngs.length > 1) {
          const lastLatLng = latlngs[latlngs.length - 1];
          const xMarker = L.marker(lastLatLng, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<span style="color: #003078; font-size: 15px; background: none; border: none; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 1px 0 #fff, 1px 0px 0 #fff, 0px -1px 0 #fff, -1px 0px 0 #fff;">&#10005;</span>`
            })
          }).addTo(map);
          markersRef.current.push(xMarker);
        }
      }

      // Add route name label to the middle of the route if there are at least 2 points
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
            html: `<span class=\"govuk-body\" style=\"font-size: 15px; color: #111; white-space: nowrap; display: inline-block; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 1px 0 #fff, 1px 0px 0 #fff, 0px -1px 0 #fff, -1px 0px 0 #fff;\">${routeName || 'Route'}</span>`,
            iconSize: undefined,
            iconAnchor: [50, 12],
          })
        }).addTo(map);
        markersRef.current.push(routeLabelMarker);
      }

      // Draw the route polyline if there are at least 2 valid points
      if (safeLatLngs.length >= 2) {
        try {
          if (mode === 'edit') {
            // Yellow border (thicker) under blue line
            L.polyline(safeLatLngs, {
              color: 'yellow',
              weight: 10,
              opacity: 1,
              pane: 'overlayPane',
            }).addTo(map);
            polylineRef.current = L.polyline(safeLatLngs, {
              color: '#1d70b8', // GOV blue
              weight: 5,
              opacity: 1,
              pane: 'overlayPane',
            }).addTo(map);
          } else {
            // Overview: just blue line
            polylineRef.current = L.polyline(safeLatLngs, {
              color: '#1d70b8',
              weight: 5,
              opacity: 1,
              pane: 'overlayPane',
            }).addTo(map);
          }
          const bounds = L.latLngBounds(safeLatLngs);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [10, 10], maxZoom: 18 });
          }
        } catch {
          // Silently ignore fitBounds errors
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