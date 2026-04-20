'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalHotspot } from '@/types';
import { useTranslation } from '@/lib/translation';

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-slate-400">Loading globe...</div>
    </div>
  ),
});

interface GlobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: GlobalHotspot[];
}

const categoryColors: Record<GlobalHotspot['category'], string> = {
  conflict: '#ef4444',
  protest: '#f59e0b',
  disaster: '#8b5cf6',
  politics: '#3b82f6',
  economy: '#10b981',
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

export function GlobeModal({ isOpen, onClose, hotspots }: GlobeModalProps) {
  const globeRef = useRef<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<GlobalHotspot | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { language } = useTranslation();
  
  const categoryLabels = language === 'cs' ? categoryLabelsCZ : categoryLabelsEN;

  useEffect(() => {
    if (isOpen) {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 100,
      });
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (globeRef.current && isOpen) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 150;
      controls.maxDistance = 400;
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.2 }, 0);
    }
  }, [isOpen]);

  const handlePointClick = useCallback((point: GlobalHotspot) => {
    setSelectedHotspot(point);
    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: point.lat, lng: point.lng, altitude: 1.5 },
        1000
      );
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

  const pointsData = hotspots.map(h => ({
    ...h,
    size: 0.05 + (h.intensity / 10) * 0.3,
    color: categoryColors[h.category],
  }));

  const ringsData = hotspots.filter(h => h.intensity >= 5).map(h => ({
    lat: h.lat,
    lng: h.lng,
    maxR: 3 + (h.intensity / 10) * 5,
    propagationSpeed: 2,
    repeatPeriod: 1000 + (10 - h.intensity) * 200,
    color: categoryColors[h.category],
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950 to-transparent">
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'cs' ? 'Globální Události' : 'Global Hotspots'}
              </h2>
              <p className="text-xs text-slate-400">
                {hotspots.length} {language === 'cs' ? 'aktivních událostí' : 'active events'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute top-20 left-4 z-10 flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <span key={cat} className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-300">{categoryLabels[cat as GlobalHotspot['category']]}</span>
              </span>
            ))}
          </div>

          {/* Globe */}
          <div className="w-full h-full">
            <Globe
              ref={globeRef}
              width={dimensions.width}
              height={dimensions.height}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={pointsData}
              pointLat="lat"
              pointLng="lng"
              pointAltitude="size"
              pointColor="color"
              pointRadius={0.5}
              pointLabel={(d: object) => {
                const point = d as GlobalHotspot & { color: string };
                return `
                  <div style="background: rgba(15,23,42,0.95); padding: 8px 12px; border-radius: 8px; border: 1px solid #334155;">
                    <div style="font-weight: bold; color: white;">${point.region}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${point.topEvent?.slice(0, 60)}...</div>
                  </div>
                `;
              }}
              onPointClick={(point: object) => handlePointClick(point as GlobalHotspot)}
              ringsData={ringsData}
              ringLat="lat"
              ringLng="lng"
              ringMaxRadius="maxR"
              ringPropagationSpeed="propagationSpeed"
              ringRepeatPeriod="repeatPeriod"
              ringColor="color"
              atmosphereColor="#4f46e5"
              atmosphereAltitude={0.2}
            />
          </div>

          {/* Selected Hotspot Detail */}
          <AnimatePresence>
            {selectedHotspot && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-600 p-4 shadow-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${categoryColors[selectedHotspot.category]}20`,
                        color: categoryColors[selectedHotspot.category],
                      }}
                    >
                      {categoryLabels[selectedHotspot.category]}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedHotspot.region}</h3>
                  </div>
                  <button 
                    onClick={handleCloseDetail}
                    className="text-slate-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-slate-300 mb-3">{selectedHotspot.topEvent}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{selectedHotspot.eventCount} {language === 'cs' ? 'událostí' : 'events'}</span>
                  <span>{language === 'cs' ? 'Intenzita' : 'Intensity'}: {selectedHotspot.intensity}/10</span>
                </div>
                {selectedHotspot.url && (
                  <a
                    href={selectedHotspot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium"
                  >
                    {language === 'cs' ? 'Číst více' : 'Read More'}
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
