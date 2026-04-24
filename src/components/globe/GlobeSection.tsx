'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GlobalHotspot } from '@/types';
import { useTranslation } from '@/lib/translation';

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-slate-900 rounded-xl">
      <div className="text-slate-400">Loading globe...</div>
    </div>
  ),
});

interface GlobeSectionProps {
  hotspots: GlobalHotspot[];
}

const categoryColors: Record<GlobalHotspot['category'], string> = {
  conflict: '#ef4444', // red
  protest: '#f59e0b', // amber
  disaster: '#8b5cf6', // purple
  politics: '#3b82f6', // blue
  economy: '#10b981', // green
};

const categoryLabelsEN: Record<GlobalHotspot['category'], string> = {
  conflict: 'Conflict',
  protest: 'Protest',
  disaster: 'Disaster',
  politics: 'Politics',
  economy: 'Economy',
};

const categoryLabelsCZ: Record<GlobalHotspot['category'], string> = {
  conflict: 'Konflikt',
  protest: 'Protest',
  disaster: 'Katastrofa',
  politics: 'Politika',
  economy: 'Ekonomika',
};

export function GlobeSection({ hotspots }: GlobeSectionProps) {
  const globeRef = useRef<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<GlobalHotspot | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 500 });
  const { language, translate, isTranslating } = useTranslation();
  const [translatedEvents, setTranslatedEvents] = useState<Record<string, string>>({});
  
  const categoryLabels = language === 'cs' ? categoryLabelsCZ : categoryLabelsEN;

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('globe-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(500, window.innerHeight * 0.5),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Setup globe controls
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enableZoom = true;
      controls.minDistance = 150;
      controls.maxDistance = 500;
      
      // Initial view - Europe centered
      globeRef.current.pointOfView({ lat: 45, lng: 10, altitude: 2.2 }, 0);
    }
  }, []);

  const handlePointClick = useCallback((point: GlobalHotspot) => {
    setSelectedHotspot(point);
    
    // Zoom to point
    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: point.lat, lng: point.lng, altitude: 1.5 },
        1000
      );
      // Stop auto-rotation when focusing
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  const handleCloseDetail = () => {
    setSelectedHotspot(null);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.2 }, 1000);
    }
  };

  // Translate selected hotspot event when language changes
  useEffect(() => {
    if (language === 'cs' && selectedHotspot && !translatedEvents[selectedHotspot.id]) {
      const translateEvent = async () => {
        const translated = await translate([selectedHotspot.topEvent]);
        if (translated[0]) {
          setTranslatedEvents(prev => ({
            ...prev,
            [selectedHotspot.id]: translated[0]
          }));
        }
      };
      translateEvent();
    }
  }, [language, selectedHotspot, translate, translatedEvents]);

  const getTopEvent = (hotspot: GlobalHotspot) => {
    if (language === 'cs' && translatedEvents[hotspot.id]) {
      return translatedEvents[hotspot.id];
    }
    return hotspot.topEvent;
  };

  // Transform hotspots for globe - points
  const pointsData = hotspots.map(h => ({
    ...h,
    size: 0.05 + (h.intensity / 10) * 0.3, // Size based on intensity
    color: categoryColors[h.category],
  }));

  // Transform hotspots for rings (pulsating glow effect)
  const ringsData = hotspots.filter(h => h.intensity >= 5).map(h => ({
    lat: h.lat,
    lng: h.lng,
    maxR: 3 + (h.intensity / 10) * 5, // Larger rings for higher intensity
    propagationSpeed: 2,
    repeatPeriod: 1000 + (10 - h.intensity) * 200, // Faster pulse for higher intensity
    color: categoryColors[h.category],
  }));

  if (hotspots.length === 0) {
    return (
      <section className="space-y-4">
        <div className="w-full h-[300px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-400">{language === 'cs' ? 'Načítám globální události...' : 'Loading global events...'}</p>
        </div>
      </section>
    );
  }

  // Legend for categories
  const legendContent = (
    <div className="flex items-center gap-2 text-xs">
      {Object.entries(categoryColors).slice(0, 4).map(([cat, color]) => (
        <span key={cat} className="flex items-center gap-1">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="text-slate-400 hidden sm:inline">{categoryLabels[cat as GlobalHotspot['category']]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{hotspots.length} {language === 'cs' ? 'událostí' : 'events'}</span>
        {legendContent}
      </div>

      <div className="relative">
        {/* Globe Container */}
        <div 
          id="globe-container"
          className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700"
          style={{ height: dimensions.height }}
        >
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            // Points/Markers
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointAltitude="size"
            pointColor="color"
            pointRadius={0.5}
            pointLabel={(d: object) => {
              const point = d as GlobalHotspot & { color: string };
              const catLabel = categoryLabels[point.category] || 'Event';
              return `
                <div style="background: rgba(15,23,42,0.95); padding: 8px 12px; border-radius: 8px; border: 1px solid #334155;">
                  <div style="font-weight: bold; color: white;">${point.region}</div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${point.topEvent?.slice(0, 60)}...</div>
                  <div style="font-size: 10px; color: ${point.color}; margin-top: 4px;">${catLabel} • ${point.eventCount} events</div>
                </div>
              `;
            }}
            onPointClick={(point: object) => handlePointClick(point as GlobalHotspot)}
            onPointHover={(point: unknown) => {
              document.body.style.cursor = point ? 'pointer' : 'grab';
            }}
            
            // Rings (pulsating glow for high-intensity hotspots)
            ringsData={ringsData}
            ringLat="lat"
            ringLng="lng"
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            ringColor="color"
            
            // Styling
            atmosphereColor="#4f46e5"
            atmosphereAltitude={0.2}
          />
        </div>

        {/* Selected Hotspot Detail Panel */}
        {selectedHotspot && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-600 p-4 shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${categoryColors[selectedHotspot.category]}20`,
                    color: categoryColors[selectedHotspot.category],
                    border: `1px solid ${categoryColors[selectedHotspot.category]}40`
                  }}
                >
                  {categoryLabels[selectedHotspot.category]}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedHotspot.region}</h3>
              </div>
              <button 
                onClick={handleCloseDetail}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-slate-300 mb-3">{getTopEvent(selectedHotspot)}</p>
            
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>{selectedHotspot.eventCount} {language === 'cs' ? 'událostí' : 'events tracked'}</span>
              <span>{language === 'cs' ? 'Intenzita' : 'Intensity'}: {selectedHotspot.intensity}/10</span>
            </div>
            
            {selectedHotspot.sources.length > 0 && (
              <div className="text-xs text-slate-500 mb-3">
                {language === 'cs' ? 'Zdroje' : 'Sources'}: {selectedHotspot.sources.join(', ')}
              </div>
            )}
            
            {selectedHotspot.url && (
              <a
                href={selectedHotspot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors"
              >
                {language === 'cs' ? 'Číst více' : 'Read More'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Hotspots List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {hotspots.slice(0, 8).map((hotspot) => (
          <button
            key={hotspot.id}
            onClick={() => handlePointClick(hotspot)}
            className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${
              selectedHotspot?.id === hotspot.id
                ? 'bg-slate-700 border-amber-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColors[hotspot.category] }}
              />
              <span className="text-sm font-medium text-white truncate">{hotspot.region}</span>
            </div>
            <p className="text-xs text-slate-400 truncate">{hotspot.topEvent.slice(0, 40)}...</p>
          </button>
        ))}
      </div>
    </section>
  );
}
