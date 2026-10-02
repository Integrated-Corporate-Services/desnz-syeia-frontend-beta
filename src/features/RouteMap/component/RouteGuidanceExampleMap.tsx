import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';

proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs',
);

interface ExamplePoint {
  easting: string;
  northing: string;
}

interface ExampleRoute {
  points: ExamplePoint[];
  routeName: string;
}

interface RouteGuidanceExampleMapProps {
  routes: ExampleRoute[];
  numberedRouteName?: string;
  highlightedRouteName?: string;
}

const ROUTE_COLOR = '#1d70b8';

const RouteGuidanceExampleMap: React.FC<RouteGuidanceExampleMapProps> = ({ routes, numberedRouteName, highlightedRouteName }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = L.map(mapElement.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      minZoom: 5,
      maxZoom: 18,
    }).setView([54.5, -3.5], 6);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const routePoints: L.LatLng[] = [];
    routes.forEach((route) => {
      const points = route.points
        .filter(({ easting, northing }) => /^\d{6}$/.test(easting) && /^\d{6}$/.test(northing))
        .map(({ easting, northing }) => {
          const [longitude, latitude] = proj4('EPSG:27700', 'WGS84', [Number(easting), Number(northing)]);
          return L.latLng(latitude, longitude);
        })
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

      routePoints.push(...points);
      if (points.length > 0) {
        const label = L.divIcon({
          className: 'route-guidance-example-map__label',
          html: `<span>${route.routeName}</span>`,
          iconAnchor: [0, 0],
        });
        L.marker(points[Math.floor(points.length / 2)], { icon: label, interactive: false, keyboard: false }).addTo(map);
      }
      if (route.routeName === numberedRouteName) {
        points.forEach((point, index) => {
          const pointNumber = L.divIcon({
            className: 'route-guidance-example-map__point-number',
            html: `<span>${index + 1}</span>`,
            iconAnchor: [4, 7],
          });
          L.marker(point, { icon: pointNumber, interactive: false, keyboard: false }).addTo(map);
        });
      }
      if (points.length >= 2) {
        if (route.routeName === highlightedRouteName) {
          L.polyline(points, { color: ROUTE_COLOR, weight: 7, opacity: 1 }).addTo(map);
          L.polyline(points, { color: '#ffdd00', weight: 3, opacity: 1 }).addTo(map);
        } else {
          L.polyline(points, { color: ROUTE_COLOR, weight: 5, opacity: 1 }).addTo(map);
        }
      }
    });

    if (routePoints.length >= 2) {
      map.fitBounds(L.latLngBounds(routePoints), { padding: [16, 16], maxZoom: 18 });
    } else if (routePoints.length === 1) {
      map.setView(routePoints[0], 15);
    }

    mapElement.current.querySelectorAll('.leaflet-tile-pane img').forEach((tile) => {
      tile.setAttribute('alt', '');
      tile.setAttribute('role', 'presentation');
    });
    map.on('tileload', () => {
      mapElement.current?.querySelectorAll('.leaflet-tile-pane img:not([alt])').forEach((tile) => {
        tile.setAttribute('alt', '');
        tile.setAttribute('role', 'presentation');
      });
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [routes]);

  const routeNames = routes.map(({ routeName }) => routeName).join(' and ');

  return (
    <div
      ref={mapElement}
      className="route-guidance-example-map"
      role="group"
      aria-label={`Map showing ${routeNames}. Coordinate details are provided in the adjacent tables.`}
    />
  );
};

export default RouteGuidanceExampleMap;
