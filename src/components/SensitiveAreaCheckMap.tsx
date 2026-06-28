import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';

// Add OSGB36 (EPSG:27700) projection definition for proj4
proj4.defs('EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +units=m +no_defs');


export interface RoutePoint {
  easting: string;
  northing: string;
  pointId?: string;
}

export interface MapRoute {
  points: RoutePoint[];
  routeName?: string;
}


interface SensitiveAreaCheckMapProps {
  points?: RoutePoint[]; // for backward compatibility
  selectedIdx?: number | null;
  setPoints?: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSelectedIdx?: React.Dispatch<React.SetStateAction<number | null>>;
  routeName?: string;
  routeId?: string;
  mode?: 'overview' | 'edit'; // overview: project overview, edit: route map
  routes?: MapRoute[]; // NEW: array of routes for multi-route display
}

const ROUTE_COLOR = '#1d70b8'; // GOV blue
const MARKER_COLOR = '#010103ff';

const SensitiveAreaCheckMap: React.FC<SensitiveAreaCheckMapProps> = ({ points, selectedIdx, setPoints, setSelectedIdx, routeName, mode = 'overview', routes }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  // Track all polylines for multi-route
  const polylineRefs = useRef<L.Polyline[]>([]);
  const markersRef = useRef<any[]>([]);

  // Accurate OSGB36 (British National Grid) to WGS84 conversion using proj4
  function osgbToLatLng(easting: number, northing: number): [number, number] {
    // Use proj4 to convert OSGB36 easting/northing to WGS84 lat/lng
    const [lng, lat] = proj4('EPSG:27700', 'WGS84', [easting, northing]);
    return [lat, lng]; // Leaflet expects [lat, lng]
  }

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const ukBounds = L.latLngBounds(
        L.latLng(49.5, -8.5), // Southwest
        L.latLng(61, 2)       // Northeast
      );
      
      const map = L.map(mapRef.current, {
        maxBounds: ukBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 5,
        maxZoom: 18
      }).setView([54.5, -3.5], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstance.current = map;
      
      // Fix accessibility: Add alt text and aria-hidden to map tiles
      setTimeout(() => {
        const mapContainer = mapRef.current;
        if (mapContainer) {
          const tileImages = mapContainer.querySelectorAll('.leaflet-tile-pane img');
          tileImages.forEach((img: Element) => {
            if (img instanceof HTMLImageElement) {
              img.setAttribute('alt', 'Map tile');
              img.setAttribute('role', 'presentation');
            }
          });
        }
      }, 100);
      
      // Continue fixing tiles as they load
      map.on('tileload', () => {
        const mapContainer = mapRef.current;
        if (mapContainer) {
          const tileImages = mapContainer.querySelectorAll('.leaflet-tile-pane img:not([alt])');
          tileImages.forEach((img: Element) => {
            if (img instanceof HTMLImageElement) {
              img.setAttribute('alt', 'Map tile');
              img.setAttribute('role', 'presentation');
            }
          });
        }
      });
      
      map.on('click', function (e: L.LeafletMouseEvent) {
        if (selectedIdx !== null) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          // Accurate conversion from WGS84 lat/lng to OSGB36 easting/northing using proj4
          const [easting, northing] = proj4('WGS84', 'EPSG:27700', [lng, lat]);
          if (setPoints) {
            setPoints(prev => prev.map((pt, i) => i === selectedIdx ? { easting: String(Math.round(easting)), northing: String(Math.round(northing)) } : pt));
          }
        }
      });
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Empty deps - map should only be created once

  useEffect(() => {
    const map = mapInstance.current;
    if (map) {
      // Remove all polylines
      if (polylineRefs.current.length) {
        polylineRefs.current.forEach(poly => map.removeLayer(poly));
        polylineRefs.current = [];
      }
      // Remove all markers
      if (markersRef.current.length) {
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];
      }
      // In edit mode, combine existing routes with current editing route
      let allRoutes: MapRoute[] = [];
      if (mode === 'edit' && routes && routes.length > 0 && points && points.length > 0) {
        // Show all OTHER routes (background) + current route being edited (foreground)
        allRoutes = [...routes, { points, routeName }];
      } else if (routes && routes.length > 0) {
        allRoutes = routes;
      } else if (points && points.length > 0) {
        allRoutes = [{ points, routeName }];
      }

      // For bounds
      let allLatLngs: [number, number][] = [];
      markersRef.current = [];

      allRoutes.forEach((route, routeIdx) => {
        function isValidNumber(val: string) {
          // Accepts 6 digit numbers, including leading zeros, in range 000001-999999
          return /^\d{6}$/.test(val) && Number(val) >= 1 && Number(val) <= 999999;
        }
        const validPoints = route.points.filter(pt => isValidNumber(pt.easting) && isValidNumber(pt.northing));
        const latlngs = validPoints
          .map(pt => osgbToLatLng(Number(pt.easting), Number(pt.northing)))
          .filter(arr => Array.isArray(arr) && arr.length === 2 && arr.every(v => typeof v === 'number' && isFinite(v)));
        const safeLatLngs = latlngs.filter(([lat, lng]) => isFinite(lat) && isFinite(lng));
        allLatLngs = allLatLngs.concat(safeLatLngs);

        // Markers and labels for each route
        if (mode === 'edit') {
          // Only show numbered markers on the CURRENT route being edited (last route in array)
          const isCurrentRoute = routeIdx === allRoutes.length - 1;
          
          latlngs.forEach((latlng, i) => {
            const marker = L.marker(latlng, {
              icon: L.divIcon({
                className: 'custom-marker',
                html: isCurrentRoute 
                  ? `<span style="font-size: 15px; color: #111; background: none; border: none; text-shadow: -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0px 3px 0 #fff, 3px 0px 0 #fff, 0px -3px 0 #fff, -3px 0px 0 #fff;">${i + 1}</span>`
                  : `<span style="color: ${MARKER_COLOR}; font-size: 12px; font-weight: bold; background: none; border: none;">&#10005;</span>`
              })
            }).addTo(map);
            markersRef.current.push(marker);
          });
        }
        if (mode === 'overview') {
          if (latlngs.length > 0) {
            latlngs.forEach((latlng) => {
              const xMarker = L.marker(latlng, {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: `<span style="color: ${MARKER_COLOR}; font-size: 12px; font-weight: bold; background: none; border: none;">&#10005;</span>`
                })
              }).addTo(map);
              markersRef.current.push(xMarker);
            });
          }
        }
        // Route name label
        const label = route.routeName || `Route ${String.fromCharCode(65 + routeIdx)}`;
        if (latlngs.length === 1) {
          // Show route name at the single point
          const routeLabelMarker = L.marker(latlngs[0] as [number, number], {
            interactive: false,
            icon: L.divIcon({
              className: 'route-label',
              html: `<span class=\"govuk-body\" style=\"font-size: 15px; color: ${ROUTE_COLOR}; white-space: nowrap; display: inline-block; text-shadow: -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0px 3px 0 #fff, 3px 0px 0 #fff, 0px -3px 0 #fff, -3px 0px 0 #fff;\">${label}</span>`,
              iconSize: undefined,
              iconAnchor: [50, 12],
            })
          }).addTo(map);
          markersRef.current.push(routeLabelMarker);
        } else if (latlngs.length >= 2) {
          // Calculate the geometric midpoint of the polyline
          let totalDist = 0;
          const segLens: number[] = [];
          for (let i = 1; i < latlngs.length; i++) {
            const dx = latlngs[i][0] - latlngs[i-1][0];
            const dy = latlngs[i][1] - latlngs[i-1][1];
            const segLen = Math.sqrt(dx*dx + dy*dy);
            segLens.push(segLen);
            totalDist += segLen;
          }
          
          // FIX: Handle zero-length polylines (all points are identical)
          let midLatLng: [number, number];
          if (totalDist === 0) {
            // All points are at the same location, use the first point
            midLatLng = latlngs[0];
          } else {
            let midDist = totalDist / 2;
            let acc = 0;
            midLatLng = latlngs[0];
            for (let i = 1; i < latlngs.length; i++) {
              if (acc + segLens[i-1] >= midDist) {
                const remain = midDist - acc;
                // Prevent division by zero when segment length is 0
                const ratio = segLens[i-1] > 0 ? remain / segLens[i-1] : 0;
                midLatLng = [
                  latlngs[i-1][0] + (latlngs[i][0] - latlngs[i-1][0]) * ratio,
                  latlngs[i-1][1] + (latlngs[i][1] - latlngs[i-1][1]) * ratio
                ];
                break;
              }
              acc += segLens[i-1];
            }
          }
          
          // Validate coordinates before creating marker
          if (isFinite(midLatLng[0]) && isFinite(midLatLng[1])) {
            const routeLabelMarker = L.marker(midLatLng as [number, number], {
              interactive: false,
              icon: L.divIcon({
                className: 'route-label',
                html: `<span class=\"govuk-body\" style=\"font-size: 15px; color: ${ROUTE_COLOR}; white-space: nowrap; display: inline-block; text-shadow: -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0px 3px 0 #fff, 3px 0px 0 #fff, 0px -3px 0 #fff, -3px 0px 0 #fff;\">${label}</span>`,
                iconSize: undefined,
                iconAnchor: [50, 12],
              })
            }).addTo(map);
            markersRef.current.push(routeLabelMarker);
          }
        }
        // Draw the route polyline if there are at least 2 valid points
        if (safeLatLngs.length >= 2) {
          try {
            // Always draw only the blue line, no yellow border
            const poly = L.polyline(safeLatLngs, {
              color: ROUTE_COLOR,
              weight: 5,
              opacity: 1,
              pane: 'overlayPane',
            }).addTo(map);
            polylineRefs.current.push(poly);
          } catch {
            // Silently ignore fitBounds errors
          }
        }
      });

      // Fit bounds to all routes
      if (allLatLngs.length >= 2) {
        const bounds = L.latLngBounds(allLatLngs);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [2, 2], maxZoom: 20 });
        }
      } else if (allLatLngs.length === 1) {
        map.setView(allLatLngs[0], 15);
      } else {
        map.setView([54.5, -3.5], 6);
      }
    }
  }, [points, routes, mode, routeName, selectedIdx]);

  return (
    <div 
      style={{ height: 500, width: '100%' }} 
      ref={mapRef} 
      id="map"
      role="application"
      aria-label="Interactive map for viewing and selecting route points. Click on the map to set coordinates for the selected point."
      tabIndex={-1}
    />
  );
};

export default SensitiveAreaCheckMap;