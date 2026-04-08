import React, { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertCircle, Loader2, MapPin, Maximize2, Navigation } from 'lucide-react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../constants/disasterConstants';
import { useDisasterContext } from '../../contexts/DisasterContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  tooltipAnchor: [1, -34],
});

const EmptyState = ({ title, subtitle }) => (
  <div className="h-[520px] rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md flex items-center justify-center">
    <div className="text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
        <MapPin className="w-6 h-6 text-gray-500" />
      </div>
      <div className="mt-4 text-lg font-bold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{subtitle}</div>
    </div>
  </div>
);

const MapController = ({ geo, layerMode, loading }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (geo && !loading) {
      // Calculate bounds based on disaster data
      let bounds = null;
      
      if (layerMode === 'heat' && geo?.points?.length > 0) {
        // For heat mode, use points to calculate bounds
        const points = geo.points.map(p => [p.lat, p.lng]);
        bounds = L.latLngBounds(points);
      } else if (geo?.features?.length > 0) {
        // For marker mode, use features to calculate bounds
        const validFeatures = geo.features.filter(f => 
          f?.geometry?.type === 'Point' && 
          f.geometry.coordinates?.length === 2
        );
        
        if (validFeatures.length > 0) {
          const points = validFeatures.map(f => {
            const [lng, lat] = f.geometry.coordinates;
            return [lat, lng];
          });
          bounds = L.latLngBounds(points);
        }
      }
      
      // Fit map to bounds if we have valid bounds, otherwise use default
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Fallback to default center and zoom
        map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);
      }
    }
  }, [geo, layerMode, loading, map]);

  return null;
};

const DisasterMap = ({ geo, loading, error }) => {
  const { layerMode, activeType } = useDisasterContext();
  const mapRef = useRef(null);

  const featureCount = useMemo(() => {
    if (!geo) return 0;
    if (layerMode === 'heat') return geo?.points?.length || 0;
    return geo?.features?.length || 0;
  }, [geo, layerMode]);

  const headerRight = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading layer…
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-600 font-semibold">
        {featureCount} points
      </div>
    );
  }, [loading, featureCount]);

  if (error) {
    return (
      <EmptyState
        title="Failed to load disaster layer"
        subtitle={error?.message || 'Please try again.'}
      />
    );
  }

  if (!geo) {
    return (
      <EmptyState
        title="No layer loaded yet"
        subtitle="Choose a disaster type to load live map data."
      />
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/70 flex items-center justify-between">
        <div>
          <div className="text-lg font-extrabold text-gray-900">Live Map</div>
          <div className="text-xs text-gray-500 font-semibold">Type: {activeType} • Mode: {layerMode}</div>
        </div>
        {headerRight}
      </div>

      <div className="h-[520px]">
        <MapContainer
          ref={mapRef}
          center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController geo={geo} layerMode={layerMode} loading={loading} />
          
          {/* Map Control Buttons */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => {
                if (mapRef.current) {
                  const map = mapRef.current;
                  map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);
                }
              }}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 hover:bg-white transition-colors"
              title="Reset to default view"
            >
              <Navigation className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => {
                const mapContainer = mapRef.current?.getContainer();
                if (mapContainer) {
                  if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen().catch(err => {
                      console.log(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                  } else {
                    document.exitFullscreen();
                  }
                }
              }}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 hover:bg-white transition-colors"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {layerMode === 'heat'
            ? (geo?.points || []).map((p, idx) => (
                <CircleMarker
                  key={`${p.lat}-${p.lng}-${idx}`}
                  center={[p.lat, p.lng]}
                  radius={6 + Math.round((p.intensity || 0.3) * 10)}
                  pathOptions={{
                    color: '#EAB308',
                    fillColor: '#EAB308',
                    fillOpacity: Math.min(0.85, Math.max(0.2, p.intensity || 0.3)),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">{p.type || activeType}</div>
                      <div className="text-gray-600">Intensity: {Number(p.intensity || 0).toFixed(2)}</div>
                      {p.source && <div className="text-gray-600">Source: {p.source}</div>}
                    </div>
                  </Popup>
                </CircleMarker>
              ))
            : (geo?.features || []).map((f, idx) => {
                if (f?.geometry?.type !== 'Point') return null;
                const [lng, lat] = f.geometry.coordinates || [];
                if (typeof lat !== 'number' || typeof lng !== 'number') return null;

                const title =
                  f.properties?.title || f.properties?.name || f.properties?.raw?.properties?.place || 'Event';
                const url = f.properties?.url || f.properties?.raw?.properties?.url;
                const src = f.properties?.source || 'Source';

                return (
                  <Marker key={`${lng}-${lat}-${idx}`} position={[lat, lng]}>
                    <Popup>
                      <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-green-700" />
                          <div className="font-bold text-gray-900">{title}</div>
                        </div>
                        <div className="text-gray-600">Type: {f.properties?.eventType || activeType}</div>
                        <div className="text-gray-600">Source: {src}</div>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline"
                          >
                            <MapPin className="w-4 h-4" />
                            Open source
                          </a>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
        </MapContainer>
      </div>

      {featureCount === 0 && !loading && (
        <div className="px-6 py-4 border-t border-gray-200/70 text-sm text-gray-600">
          No results for the current filters. Try switching disaster type.
        </div>
      )}
    </div>
  );
};

export default DisasterMap;
